import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { useCatalogStore } from '../../modules/catalog/store/catalog.store';
import { useAuthStore } from '../store/auth.store';
import { Branch } from '../../modules/catalog/models/Branch';
import { useAppTheme } from '../contexts/ThemeContext';

export const GoogleMapsScreen = () => {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token);
  const { branches, fetchBranches, loading, error } = useCatalogStore();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const { isDark, colors } = useAppTheme();

  useEffect(() => {
    if (token) fetchBranches(token);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (token) fetchBranches(token);
    }, [token])
  );

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

  const generateMapHTML = () => `<!DOCTYPE html>
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
    var markers=[];
    map.eachLayer(function(l){if(l instanceof L.Marker)markers.push(l)});
    if(markers.length>0)map.fitBounds(L.featureGroup(markers).getBounds().pad(0.1));
  </script>
</body></html>`;

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
    <View style={{ flex: 1 }}>
      {/* Map - Fullscreen */}
      {loading && branches.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando mapa...</Text>
        </View>
      ) : !loading && branches.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>{error ? '\u26A0\uFE0F' : '\u{1F50D}'}</Text>
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            {error ? 'Error al cargar' : 'Sin sucursales'}
          </Text>
          {error && token && (
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => fetchBranches(token)}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <WebView
            source={{ html: generateMapHTML() }}
            style={{ flex: 1, backgroundColor: 'transparent' }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          />

          {/* Overlay Header */}
          <View style={styles.overlayHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.overlayBackButton}>
              <Text style={styles.overlayBackText}>{'\u2190'}</Text>
            </TouchableOpacity>
            <View style={styles.overlayTitleContainer}>
              <Text style={styles.overlayTitle}>Mapa de Sucursales</Text>
              <Text style={styles.overlayBadge}>{branches.length} sucursales</Text>
            </View>
          </View>

          {/* Selected Branch Info */}
          {selectedBranch && (
            <View style={[styles.branchCard, { backgroundColor: colors.surface }]}>
              <View style={styles.branchHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.branchName, { color: colors.textPrimary }]}>
                    {selectedBranch.name}
                  </Text>
                  <Text style={[styles.branchCoords, { color: colors.textSecondary }]}>
                    {Number(selectedBranch.coordinates_lat).toFixed(4)}, {Number(selectedBranch.coordinates_long).toFixed(4)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedBranch(null)} style={styles.closeButton}>
                  <Text style={{ fontSize: 18, color: colors.textSecondary }}>{'\u2715'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.branchActions}>
                <TouchableOpacity
                  style={[styles.directionsButton, { backgroundColor: colors.primary }]}
                  onPress={() => openDirections(Number(selectedBranch.coordinates_lat), Number(selectedBranch.coordinates_long))}
                >
                  <Text style={styles.directionsText}>{'\u{1F4CD}'} Como llegar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.menuButton, { backgroundColor: isDark ? '#333' : '#F3F4F6' }]}
                  onPress={() => {
                    setSelectedBranch(null);
                    navigation.navigate('Menu', { branchId: selectedBranch.id, branchName: selectedBranch.name });
                  }}
                >
                  <Text style={[styles.menuText, { color: colors.textPrimary }]}>Ver Menu</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Branches List */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.branchesList, { backgroundColor: colors.surface }]}
            contentContainerStyle={{ paddingHorizontal: 12 }}
          >
            {branches.map(branch => (
              <TouchableOpacity
                key={branch.id}
                style={[
                  styles.branchChip,
                  {
                    backgroundColor: selectedBranch?.id === branch.id ? colors.primary : isDark ? '#333' : '#F3F4F6',
                    borderColor: selectedBranch?.id === branch.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedBranch(branch)}
              >
                <Text style={[
                  styles.branchChipText,
                  { color: selectedBranch?.id === branch.id ? '#fff' : colors.textPrimary },
                ]}>
                  {branch.name.replace('El Catire HotDog - ', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  headerBadge: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  branchCard: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  branchName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  branchCoords: {
    fontSize: 12,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  branchActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  directionsButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  directionsText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  menuButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  menuText: {
    fontWeight: '600',
    fontSize: 14,
  },
  branchesList: {
    maxHeight: 60,
    paddingVertical: 10,
  },
  branchChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  branchChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(236, 49, 55, 0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  overlayBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  overlayBackText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
  },
  overlayTitleContainer: {
    flex: 1,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  overlayBadge: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});
