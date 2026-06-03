import React from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Linking, Modal, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { Area, Container, Title, Icon } from "../components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import opening_hours from "opening_hours";
import { Share } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { EVENTS_API_URL } from "../config/events";

type Place = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  opening_hours?: string;
  free?: boolean;
};

const ITAPEVI_PLACES: Place[] = [
  {
    id: "parque_do_povo",
    name: "Parque do Povo",
    description: "Área verde pública com pistas e equipamentos de ginástica.",
    latitude: -23.5375,
    longitude: -46.8979,
    free: true
  },
  {
    id: "praça_itaqueri",
    name: "Praça Central",
    description: "Praça pública usada para atividades e eventos gratuitos.",
    latitude: -23.5305,
    longitude: -46.9021,
    free: true
  },
  {
    id: "quadra_prefeitura",
    name: "Quadra da Prefeitura",
    description: "Local com aulas eventuais de zumba e esportes promovidos pela prefeitura.",
    latitude: -23.5332,
    longitude: -46.9012,
    free: true
  }
];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const NearbyPage: React.FC = () => {
  const [location, setLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = React.useState<Place | null>(null);
  const [eventsLoading, setEventsLoading] = React.useState(false);
  const [events, setEvents] = React.useState<any[] | null>(null);
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permissão de localização negada. Mostrando locais sugeridos.");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch (err) {
        setError("Não foi possível obter localização. Mostrando locais sugeridos.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
    // also try to fetch real places from OpenStreetMap (Nominatim + Overpass)
    const fetchOsmPlaces = async () => {
      try {
        setLoading(true);
        // get bounding box for Itapevi
        const nominatimRes = await fetch(
          "https://nominatim.openstreetmap.org/search.php?q=Itapevi+SP,+Brazil&format=jsonv2"
        );
        const nominatimJson = await nominatimRes.json();
        if (!nominatimJson || nominatimJson.length === 0) return;
        const place = nominatimJson[0];
        const bbox = place.boundingbox; // [south, north, west, east] or [south, north, west, east]
        // Overpass expects: south,west,north,east
        const south = bbox[0];
        const north = bbox[1];
        const west = bbox[2];
        const east = bbox[3];

        const overpassQuery = `[
out:json][timeout:25];(
  node["leisure"~"park|garden|pitch|playground"](${south},${west},${north},${east});
  way["leisure"~"park|garden|pitch|playground"](${south},${west},${north},${east});
  node["amenity"~"playground|fitness_station|sports_centre|community_centre"](${south},${west},${north},${east});
  way["amenity"~"playground|fitness_station|sports_centre|community_centre"](${south},${west},${north},${east});
);
out center tags;`;

        const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(overpassQuery)}`,
        });
        const overpassJson = await overpassRes.json();
        if (overpassJson && overpassJson.elements && overpassJson.elements.length > 0) {
          const osmPlaces: Place[] = overpassJson.elements.map((el: any) => {
            const lat = el.lat ?? el.center?.lat;
            const lon = el.lon ?? el.center?.lon;
            return {
              id: `${el.type}-${el.id}`,
              name: el.tags?.name ?? el.tags?.leisure ?? "Local público",
              description: el.tags?.description ?? el.tags?.note ?? "",
              latitude: lat,
              longitude: lon,
              opening_hours: el.tags?.opening_hours,
              free: true,
            } as Place;
          });
          // replace default places with fetched ones
          if (osmPlaces.length > 0) {
            // sort by distance if we have device location
            if (location) {
              osmPlaces.forEach((p) => {
                // attach distance for sorting/rendering
                (p as any).distance = haversineDistance(location.latitude, location.longitude, p.latitude, p.longitude);
              });
              osmPlaces.sort((a: any, b: any) => a.distance - b.distance);
            }
            // set places into a ref by replacing ITAPEVI_PLACES variable via local var
            (PlacesRef.current as any) = osmPlaces;
          }
        }
      } catch (e) {
        // ignore and keep static suggestions
      } finally {
        setLoading(false);
      }
    };

    // small ref to allow replacing places without rewriting constant
    fetchOsmPlaces();
    // load favorites
    const loadFavs = async () => {
      try {
        const raw = await AsyncStorage.getItem("favorites");
        if (raw) setFavorites(JSON.parse(raw));
      } catch (e) {
        // ignore
      }
    };
    loadFavs();
  }, []);

  // use mutable ref to hold places list (default fallback to static)
  const PlacesRef = React.useRef<Place[] | null>(null);

  const places = React.useMemo(() => {
    const source = PlacesRef.current ?? ITAPEVI_PLACES;
    if (!location) return source;
    return (source as any)
      .map((p: any) => ({ ...p, distance: haversineDistance(location.latitude, location.longitude, p.latitude, p.longitude) }))
      .sort((a: any, b: any) => a.distance - b.distance);
  }, [location]);

  function formatOpeningHours(oh: string) {
    try {
      const ohObj: any = new (opening_hours as any)(oh);
      // human readable for today
      const now = new Date();
      const isOpen = ohObj.getState();
      const timeframe = ohObj.getOpenIntervals(now, new Date(now.getTime() + 7 * 24 * 3600 * 1000));
      // prefer simple message
      if (isOpen) return 'Aberto agora';
      if (timeframe && timeframe.length > 0) return 'Aberto em breve';
      return oh;
    } catch (e) {
      return oh;
    }
  }

  return (
    <LinearGradient colors={["#050816", "#0b1120"]} style={{ flex: 1 }}>
      <Container style={{ flex: 1, padding: 24, justifyContent: "flex-start" }}>
        <Area style={{ marginBottom: 18 }}>
          <Title style={{ color: "#f8fafc", fontSize: 24, textAlign: "left" }}>Locais próximos em Itapevi-SP</Title>
        </Area>

        <Area style={{ marginBottom: 12 }}>
          <Text style={{ color: "#cbd5e1" }}>
            Estes locais são sugestões ilustrativas com base em pontos públicos conhecidos. Verifique localmente e tome precauções de segurança.
          </Text>
        </Area>

        {loading && <ActivityIndicator color="#f8fafc" />}
        {error ? <Text style={{ color: "#f87171", marginBottom: 12 }}>{error}</Text> : null}

        <Area style={{ height: 240, borderRadius: 18, overflow: "hidden", marginBottom: 16 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: location?.latitude ?? -23.5344,
              longitude: location?.longitude ?? -46.9004,
              latitudeDelta: 0.06,
              longitudeDelta: 0.06,
            }}
          >
            {places.map((place: any) => (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                title={place.name}
                description={place.description}
                pinColor={place.free ? "#34d399" : "#60a5fa"}
              />
            ))}
            {location ? (
              <Marker
                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                title="Você"
                pinColor="#4f46e5"
              />
            ) : null}
          </MapView>
        </Area>

        <FlatList
          data={places as any}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => {
            const getIcon = (p: any) => {
              const name = (p.name || "").toLowerCase();
              const desc = (p.description || "").toLowerCase();
              if (name.includes("praça") || name.includes("square") || desc.includes("praça")) return "🏛️";
              if (name.includes("parque") || name.includes("park") || desc.includes("parque")) return "🏞️";
              if (name.includes("playground") || name.includes("parquinho") || desc.includes("playground")) return "🛝";
              if (name.includes("quadra") || name.includes("court") || desc.includes("quadra")) return "🏀";
              if (name.includes("academia") || name.includes("fitness") || desc.includes("fitness")) return "🏋️‍♀️";
              return "📍";
            };

            const icon = getIcon(item);

            return (
              <View style={{
                flexDirection: "row",
                alignItems: "flex-start",
                backgroundColor: "#071028",
                padding: 12,
                borderRadius: 10,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#0b2240", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Icon emojiFallback={icon} size={22} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#f8fafc", fontSize: 16, fontWeight: "700" }}>{item.name}</Text>
                  {item.description ? <Text style={{ color: "#cbd5e1", marginTop: 4 }}>{item.description}</Text> : null}
                  {item.opening_hours ? (
                    <Text style={{ color: "#f1f5f9", marginTop: 6 }}>Horário: {formatOpeningHours(item.opening_hours)}</Text>
                  ) : null}
                  {location && item.distance != null ? (
                    <Text style={{ color: "#94a3b8", marginTop: 6 }}>{(item.distance as number).toFixed(2)} km</Text>
                  ) : null}
                  <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
                    {item.free ? <Text style={{ color: "#86efac", marginRight: 12 }}>Gratuito</Text> : null}
                    <TouchableOpacity
                      onPress={() => setSelectedPlace(item)}
                      style={{ paddingVertical: 6, marginRight: 12 }}
                    >
                      <Text style={{ color: "#60a5fa", fontWeight: "700" }}>Abrir no mapa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={async () => {
                        setEvents(null);
                        if (!EVENTS_API_URL) {
                          setError("Nenhum endpoint de eventos configurado. Atualize src/config/events.ts");
                          return;
                        }
                        try {
                          setEventsLoading(true);
                          const url = `${EVENTS_API_URL}?lat=${item.latitude}&lon=${item.longitude}&place_id=${encodeURIComponent(item.id)}`;
                          const res = await fetch(url);
                          if (!res.ok) throw new Error("Erro ao buscar eventos");
                          const json = await res.json();
                          setEvents(Array.isArray(json) ? json : json.events ?? []);
                        } catch (e) {
                          setError("Não foi possível obter eventos para este local.");
                        } finally {
                          setEventsLoading(false);
                        }
                      }}
                      style={{ paddingVertical: 6 }}
                    >
                      <Text style={{ color: "#60a5fa", fontWeight: "700" }}>Eventos / Programação</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          const next = { ...favorites };
                          next[item.id] = !next[item.id];
                          setFavorites(next);
                          await AsyncStorage.setItem("favorites", JSON.stringify(next));
                        } catch (e) {
                          setError("Não foi possível alterar favoritos.");
                        }
                      }}
                      style={{ paddingVertical: 6, marginLeft: 8 }}
                    >
                      <Text style={{ color: favorites[item.id] ? "#f59e0b" : "#94a3b8", fontWeight: "700" }}>{favorites[item.id] ? 'Favorito' : 'Favoritar'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          const txt = `${item.name} - ${item.description}\nLocalização: https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
                          await Share.share({ message: txt, title: item.name });
                        } catch (e) {
                          setError("Não foi possível compartilhar.");
                        }
                      }}
                      style={{ paddingVertical: 6, marginLeft: 8 }}
                    >
                      <Text style={{ color: "#60a5fa", fontWeight: "700" }}>Compartilhar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />

        <Modal visible={!!selectedPlace} animationType="slide" onRequestClose={() => setSelectedPlace(null)}>
          <View style={{ flex: 1, backgroundColor: "#050816" }}>
            <View style={{ padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "#f8fafc", fontSize: 18, fontWeight: "700" }}>{selectedPlace?.name}</Text>
              <Pressable onPress={() => setSelectedPlace(null)} style={{ padding: 8 }}>
                <Text style={{ color: "#60a5fa" }}>Fechar</Text>
              </Pressable>
            </View>

            {selectedPlace ? (
              <View style={{ flex: 1 }}>
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: selectedPlace.latitude,
                    longitude: selectedPlace.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker coordinate={{ latitude: selectedPlace.latitude, longitude: selectedPlace.longitude }} title={selectedPlace.name} />
                </MapView>

                <View style={{ padding: 12 }}>
                  <Text style={{ color: "#cbd5e1" }}>{selectedPlace.description}</Text>
                  {selectedPlace.opening_hours ? <Text style={{ color: "#f1f5f9", marginTop: 6 }}>Horário: {selectedPlace.opening_hours}</Text> : null}

                  <View style={{ marginTop: 12 }}>
                    <Text style={{ color: "#94a3b8", marginBottom: 8 }}>Eventos</Text>
                    {eventsLoading ? <ActivityIndicator color="#f8fafc" /> : null}
                    {events && events.length > 0 ? (
                      <ScrollView style={{ maxHeight: 180 }}>
                        {events.map((ev: any, idx: number) => (
                          <View key={idx} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#102230" }}>
                            <Text style={{ color: "#f8fafc", fontWeight: "700" }}>{ev.title ?? ev.name ?? 'Evento'}</Text>
                            {ev.start && <Text style={{ color: "#cbd5e1" }}>Início: {ev.start}</Text>}
                            {ev.end && <Text style={{ color: "#cbd5e1" }}>Fim: {ev.end}</Text>}
                            {ev.description && <Text style={{ color: "#cbd5e1" }}>{ev.description}</Text>}
                          </View>
                        ))}
                      </ScrollView>
                    ) : (
                      <Text style={{ color: "#94a3b8" }}>{events ? 'Nenhum evento encontrado.' : 'Toque em "Eventos / Programação" para buscar.'}</Text>
                    )}
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </Modal>
      </Container>
    </LinearGradient>
  );
};

export default NearbyPage;
