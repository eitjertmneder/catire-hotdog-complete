import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useCatalogStore } from '../../../store/catalog.store';
import { useAuthStore } from '../../../../../shared/store/auth.store';
import { Branch } from '../../../models/Branch';
import { useAppTheme } from '../../../../../shared/contexts/ThemeContext';

const BRANCH_EMOJIS = ['🏪', '🏬', '🏗️', '🏨', '🏠', '🛖', '🏚️', '🏢'];
const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: '#D1FAE5', text: '#065F46', label: 'Abierta' },
  closed: { bg: '#FEE2E2', text: '#991B1B', label: 'Cerrada' },
};

export default function BranchesMap() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token);
  const { branches, fetchBranches, loading } = useCatalogStore(); 
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const webViewRef = useRef<any>(null);
  const { isDark, colors } = useAppTheme();

  useEffect(() => {
    if (token) {
      fetchBranches(token);
    }
  }, [token]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const branch = branches.find((b: any) => b.id === data.id);
        if (branch) setSelectedBranch(branch);
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [branches]);

  const defaultLat = 7.7667;
  const defaultLng = -72.2333;

  const generateMarkers = () => {
    if (!branches || branches.length === 0) return '';
    return branches.map(branch => {
      const lat = Number(branch.coordinates_lat);
      const lng = Number(branch.coordinates_long);
      if (isNaN(lat) || isNaN(lng)) return '';
      const shortName = branch.name.replace('El Catire HotDog - ', '');
      return `
        var marker_${branch.id} = L.marker([${lat}, ${lng}], {icon: customIcon}).addTo(map);
        marker_${branch.id}.bindTooltip('${shortName}', {
          permanent: false, direction: 'top', offset: [0, -35], className: 'custom-tooltip'
        });
        marker_${branch.id}.on('click', function() {
          var msg = JSON.stringify({id: ${branch.id}, name: '${shortName}'});
          if (window.parent && window.parent !== window) { window.parent.postMessage(msg, '*'); }
          else if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(msg); }
        });
      `;
    }).filter(Boolean).join('\n');
  };

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

  const generateMapHTML = () => `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{margin:0;padding:0}
    #map{width:100%;height:100vh}
    .custom-marker{background:linear-gradient(135deg,#EC3137,#B91C1C);color:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(236,49,55,0.5);border:3px solid white}
    .custom-marker-inner{transform:rotate(45deg);font-size:16px;color:white;font-weight:bold}
    .custom-tooltip{background:white!important;color:#1A1A2E!important;font-weight:700!important;font-size:13px!important;padding:8px 14px!important;border-radius:10px!important;box-shadow:0 4px 16px rgba(0,0,0,0.15)!important;border:none!important;white-space:nowrap!important}
    .custom-tooltip::before{border-top-color:white!important}
  </style>
</head><body>
  <div id="map"></div>
  <script>
    var map = L.map('map',{zoomControl:false}).setView([${center.lat},${center.lng}],13);
    L.control.zoom({position:'bottomright'}).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
      attribution:'&copy; OpenStreetMap &copy; CARTO',subdomains:'abcd',maxZoom:20
    }).addTo(map);
    var customIcon = L.divIcon({className:'',html:'<div class="custom-marker"><span class="custom-marker-inner">T</span></div>',iconSize:[36,36],iconAnchor:[18,36],popupAnchor:[0,-36]});
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
    } catch {}
  };

  const getBranchEmoji = (index: number) => BRANCH_EMOJIS[index % BRANCH_EMOJIS.length];
  const getStatusStyle = (branch: any) => {
    const isOpen = branch?.is_active !== false;
    return STATUS_COLORS[isOpen ? 'open' : 'closed'];
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {loading && branches.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary }}>Cargando Sucursales...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ padding: 16, paddingBottom: 12, backgroundColor: colors.primary }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>{'\u{1F4CD}'} UBICACIONES</Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                  {branches.length > 0 
                    ? `${branches.length} sucursal${branches.length !== 1 ? 'es' : ''} disponible${branches.length !== 1 ? 's' : ''}`
                    : 'Cargando...'}
                </Text>
              </View>
              <View style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: 12, 
                paddingHorizontal: 14, 
                paddingVertical: 6,
              }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 20 }}>
                  {branches.length}
                </Text>
              </View>
            </View>
          </View>

          {/* Map */}
          <View style={{ height: 220, backgroundColor: colors.surface }}>
            {Platform.OS === 'web' ? (
              <iframe srcDoc={generateMapHTML()} style={{ width: '100%', height: '100%', border: 'none' }} title="Mapa" />
            ) : (
              <WebView ref={webViewRef} source={{ html: generateMapHTML() }} style={{ flex: 1 }}
                onMessage={handleWebViewMessage} javaScriptEnabled={true} domStorageEnabled={true}
                startInLoadingState={true} renderLoading={() => (
                  <View style={{ position:'absolute',top:0,left:0,right:0,bottom:0,justifyContent:'center',alignItems:'center',backgroundColor:colors.background }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                )}
              />
            )}
          </View>

          {/* Branch list */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingBottom: selectedBranch ? 220 : 24 }}>
            {branches.map((branch, index) => {
              const shortName = branch.name.replace('El Catire HotDog - ', '');
              const isOpen = branch?.is_active !== false;
              const statusStyle = isOpen ? STATUS_COLORS.open : STATUS_COLORS.closed;
              const lat = Number(branch.coordinates_lat);
              const lng = Number(branch.coordinates_long);
              const hasCoords = !isNaN(lat) && !isNaN(lng);

              return (
                <TouchableOpacity
                  key={branch.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: isDark ? colors.border : 'transparent',
                  }}
                  activeOpacity={0.7}
                  onPress={() => setSelectedBranch(branch)}
                >
                  <View style={{
                    width: 52, height: 52, borderRadius: 16,
                    backgroundColor: isOpen ? '#FEF2F2' : '#F3F4F6',
                    justifyContent: 'center', alignItems: 'center',
                    marginRight: 14,
                  }}>
                    <Text style={{ fontSize: 26 }}>{getBranchEmoji(index)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>
                      {shortName}
                    </Text>
                    {(branch?.address) && (
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                        {'\u{1F4CD}'} {branch?.address ?? ''}
                      </Text>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
                      <View style={{ backgroundColor: statusStyle.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: statusStyle.text }}>
                          {isOpen ? '\u{2705}' : '\u{274C}'} {statusStyle.label}
                        </Text>
                      </View>
                      {hasCoords && (
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>
                          {lat.toFixed(4)}, {lng.toFixed(4)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: colors.borderLight || '#F1F5F9',
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>{'\u276F'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Selected branch bottom sheet */}
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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ 
                  width: 52, height: 52, borderRadius: 16, 
                  backgroundColor: '#FEF2F2', 
                  justifyContent: 'center', alignItems: 'center', marginRight: 14 
                }}>
                  <Text style={{ fontSize: 24 }}>{'\u{1F3EA}'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                    {selectedBranch.name.replace('El Catire HotDog - ', '')}
                  </Text>
                  {selectedBranch?.address && (
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                      {'\u{1F4CD}'} {selectedBranch?.address ?? ''}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}
                activeOpacity={0.8}
                onPress={() => { setSelectedBranch(null); navigation.navigate('Home', { branchId: selectedBranch.id, branchName: selectedBranch.name }); }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{'\u{1F525}'} VER MENU</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginTop: 8, backgroundColor: colors.borderLight || '#F1F5F9', borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}
                activeOpacity={0.8} onPress={() => setSelectedBranch(null)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 14 }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
