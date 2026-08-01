import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useCatalogStore } from '../../../store/catalog.store';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { Branch } from '../../../models/Branch';
import { useAppTheme } from '../../../../../shared/contexts/ThemeContext';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function BranchesMap() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token);
  const { branches, fetchBranches, loading, error } = useCatalogStore();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [routeToBranch, setRouteToBranch] = useState<{branchId: number, coords: string} | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);
  const { isDark, colors } = useAppTheme();
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (token) fetchBranches(token);
    getUserLocation();
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (token) fetchBranches(token);
    }, [token])
  );

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
      }
    } catch (e) {
      console.log('Location permission denied or unavailable');
    }
  };

  // Fetch route from Google Directions API
  const fetchRoute = async (destLat: number, destLng: number, branchId: number) => {
    if (!userLocation || !GOOGLE_MAPS_API_KEY) return;
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.lat},${userLocation.lng}&destination=${destLat},${destLng}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const points = decodePolyline(route.overview_polyline.points);
        const coordsStr = points.map(p => `[${p.lat},${p.lng}]`).join(',');
        setRouteToBranch({ branchId, coords: coordsStr });
        
        // Extract distance and duration
        if (route.legs && route.legs.length > 0) {
          const leg = route.legs[0];
          setRouteInfo({
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || '',
          });
        }
      }
    } catch (e) {
      console.log('Directions API error:', e);
    }
  };

  // Decode Google polyline
  const decodePolyline = (encoded: string) => {
    const points: {lat: number, lng: number}[] = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);
      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return points;
  };

  const defaultLat = 7.7667;
  const defaultLng = -72.2333;

  const getMapCenter = () => {
    if (!branches || branches.length === 0) return { lat: defaultLat, lng: defaultLng };
    const valid = branches.filter(b => !isNaN(Number(b.coordinates_lat)) && !isNaN(Number(b.coordinates_long)));
    if (valid.length === 0) return { lat: defaultLat, lng: defaultLng };
    return {
      lat: valid.reduce((s, b) => s + Number(b.coordinates_lat), 0) / valid.length,
      lng: valid.reduce((s, b) => s + Number(b.coordinates_long), 0) / valid.length,
    };
  };

  const center = getMapCenter();

  const generateMarkers = () => {
    if (!branches || branches.length === 0) return '';
    return branches.map(branch => {
      const lat = Number(branch.coordinates_lat);
      const lng = Number(branch.coordinates_long);
      if (isNaN(lat) || isNaN(lng)) return '';
      const shortName = branch.name.replace('El Catire HotDog - ', '').replace(/'/g, "\\'");
      return `
        var m_${branch.id} = L.marker([${lat}, ${lng}], {icon: customIcon}).addTo(map);
        m_${branch.id}.bindTooltip('${shortName}', {permanent:false, direction:'top', offset:[0,-35], className:'custom-tooltip'});
        m_${branch.id}.on('click', function() {
          if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(JSON.stringify({id: ${branch.id}})); }
        });
      `;
    }).filter(Boolean).join('\n');
  };

  const generateMapHTML = () => {
    const userMarker = userLocation ? `
      var userIcon = L.divIcon({
        className:'',
        html:'<div style="background:#3B82F6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.5)"></div>',
        iconSize:[18,18],iconAnchor:[9,9]
      });
      L.marker([${userLocation.lat}, ${userLocation.lng}], {icon: userIcon}).addTo(map).bindTooltip('Tu ubicacion', {direction:'top', offset:[0,-12]});
    ` : '';

    const routeLine = routeToBranch ? `
      var routeCoords = [${routeToBranch.coords}];
      var routeLine = L.polyline(routeCoords, {color:'#3B82F6', weight:5, opacity:0.8, smoothFactor:1}).addTo(map);
      map.fitBounds(routeLine.getBounds().pad(0.2));
    ` : '';

    return `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{width:100%;height:100%;margin:0;padding:0}
    .custom-tooltip{background:white!important;color:#1A1A2E!important;font-weight:700!important;font-size:13px!important;padding:8px 14px!important;border-radius:10px!important;box-shadow:0 4px 16px rgba(0,0,0,0.15)!important;border:none!important;white-space:nowrap!important}
  </style>
</head><body>
  <div id="map"></div>
  <script>
    var map = L.map('map',{zoomControl:false}).setView([${center.lat},${center.lng}],13);
    L.control.zoom({position:'bottomright'}).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
      attribution:'OpenStreetMap CARTO',subdomains:'abcd',maxZoom:20
    }).addTo(map);
    var customIcon = L.divIcon({
      className:'',
      html:'<div style="background:linear-gradient(135deg,#EC3137,#B91C1C);color:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(236,49,55,0.5);border:3px solid white"><span style="transform:rotate(45deg);font-size:16px;color:white;font-weight:bold">T</span></div>',
      iconSize:[36,36],iconAnchor:[18,36],popupAnchor:[0,-36]
    });
    ${generateMarkers()}
    ${userMarker}
    ${routeLine}
    var markers=[];
    map.eachLayer(function(l){if(l instanceof L.Marker)markers.push(l)});
    if(markers.length>0 && !routeLine)map.fitBounds(L.featureGroup(markers).getBounds().pad(0.1));
  </script>
</body></html>`;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      const branch = branches.find(b => b.id === data.id);
      if (branch) setSelectedBranch(branch);
    } catch (e) { console.warn('Operation failed:', e); }
  };

  const openDirections = (lat: number, lng: number) => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {loading && branches.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary }}>Cargando mapa...</Text>
        </View>
      ) : !loading && branches.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>{error ? '\u26A0\uFE0F' : '\u{1F50D}'}</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>
            {error ? 'Error al cargar' : 'Sin sucursales'}
          </Text>
          {error && token && (
            <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }} onPress={() => fetchBranches(token)}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Reintentar</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <WebView
            source={{ html: generateMapHTML() }}
            originWhitelist={['*']}
            style={{ flex: 1, backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="always"
            startInLoadingState={true}
            renderLoading={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          />
        </View>
      )}

      {selectedBranch && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: colors.surface,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: 20, paddingBottom: 32,
          shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15, shadowRadius: 16, elevation: 12,
          borderWidth: 1, borderColor: isDark ? colors.border : 'transparent',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
              <Text style={{ fontSize: 24 }}>{'\u{1F3EA}'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
                {selectedBranch.name.replace('El Catire HotDog - ', '')}
              </Text>
              {selectedBranch?.address && (
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                  {'\u{1F4CD}'} {selectedBranch.address}
                </Text>
              )}
              {routeInfo && (
                <View style={{ flexDirection: 'row', marginTop: 6, gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: '#1E40AF', fontWeight: '600' }}>{'\u{1F697}'} {routeInfo.duration}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: '#065F46', fontWeight: '600' }}>{'\u{1F4CF}'} {routeInfo.distance}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
            activeOpacity={0.8}
            onPress={() => { setSelectedBranch(null); navigation.navigate('Home', { branchId: selectedBranch.id, branchName: selectedBranch.name }); }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{'\u{1F525}'} VER MENU</Text>
          </TouchableOpacity>
          {(() => {
            const lat = Number(selectedBranch.coordinates_lat);
            const lng = Number(selectedBranch.coordinates_long);
            if (!isNaN(lat) && !isNaN(lng)) {
              return (
                <>
                  <TouchableOpacity
                    style={{ marginTop: 8, backgroundColor: '#DBEAFE', borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}
                    activeOpacity={0.8}
                    onPress={() => { fetchRoute(lat, lng, selectedBranch.id); }}>
                    <Text style={{ color: '#1E40AF', fontWeight: '700', fontSize: 14 }}>{'\u{1F5FA}'} VER RUTA EN MAPA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginTop: 8, backgroundColor: '#E8F5E9', borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}
                    activeOpacity={0.8}
                    onPress={() => openDirections(lat, lng)}>
                    <Text style={{ color: '#065F46', fontWeight: '700', fontSize: 14 }}>{'\u{1F697}'} ABRIR EN GOOGLE MAPS</Text>
                  </TouchableOpacity>
                </>
              );
            }
            return null;
          })()}
          <TouchableOpacity style={{ marginTop: 8, backgroundColor: colors.borderLight || '#F1F5F9', borderRadius: 14, paddingVertical: 13, alignItems: 'center' }} activeOpacity={0.8} onPress={() => setSelectedBranch(null)}>
            <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 14 }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
