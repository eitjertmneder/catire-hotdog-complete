import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/orders.styles";
import { getStatusDisplay } from "../utils/orders.utils";
import { StatusBadge } from "./StatusBadge";

export const OrderCard = ({ order, onPress, showUser = false }: any) => {
  const statusInfo = getStatusDisplay(order.status);
  return (
    <View style={styles.orderCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>#{order.id.substring(0, 8).toUpperCase()}</Text>
          {showUser && <Text style={styles.infoText}>{order.user?.full_name}</Text>}
        </View>
        <StatusBadge statusInfo={statusInfo} />
      </View>
      <TouchableOpacity style={styles.detailsBtn} onPress={onPress}>
        <Text style={styles.detailsBtnText}>Ver Detalles</Text>
      </TouchableOpacity>
    </View>
  );
};