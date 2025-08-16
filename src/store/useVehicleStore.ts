import { create } from 'zustand';

export interface Compartment {
  id: string;
  capacity: number; // litres
  currentLevel: number; // litres
  percentage: number;
}

export interface SensorData {
  gps: {
    lat: number;
    lng: number;
    speed: number; // km/h
    heading: number; // degrees
    timestamp: string;
  };
  fuel: {
    totalFuel: number; // litres
    compartments: Compartment[];
    flowRate: number; // L/min
    timestamp: string;
  };
  tilt: {
    pitch: number; // degrees
    roll: number; // degrees
    yaw: number; // degrees
    timestamp: string;
  };
  valve: {
    drainOpen: boolean;
    drainComplete: boolean;
    mainValveStatus: 'open' | 'closed' | 'partial';
    timestamp: string;
  };
}

export interface Alert {
  id: string;
  vehicleId: string;
  type: 'theft' | 'route_violation' | 'sensor_health' | 'maintenance';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  ruleId: string;
  snapshot?: any;
}

export interface Vehicle {
  id: string;
  vehicleId: string;
  company: string;
  driverName: string;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  lastSync: string;
  geofence: {
    type: 'Polygon';
    coordinates: number[][][]; // GeoJSON: [lng, lat]
  };
  compartments: Compartment[];
  sensorData: SensorData;
  alerts: Alert[];
  route?: {
    origin: string;
    destination: string;
    estimatedArrival: string;
    progress: number; // percentage
  };
}

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  alerts: Alert[];
  isConnected: boolean;
  setVehicles: (vehicles: Vehicle[]) => void;
  updateVehicle: (vehicleId: string, data: Partial<Vehicle>) => void;
  selectVehicle: (vehicleId: string | null) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  setConnectionStatus: (connected: boolean) => void;
  getVehicleById: (id: string) => Vehicle | undefined;
  getVehiclesByRole: (role: 'manager' | 'operator' | 'driver', assignedIds: string[]) => Vehicle[];
}

// Demo vehicle data - Oman / Muscat
const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'VHC-001',
    vehicleId: 'VHC-001',
    company: 'Gujarat Petro Ltd',
    driverName: 'Rajesh Patel',
    status: 'active',
    lastSync: new Date().toISOString(),
    geofence: {
      type: 'Polygon',
      // Al Khuwair / Qurum (Muscat)  [lng, lat]
      coordinates: [
        [
          [58.3629, 23.5730],
          [58.4029, 23.5730],
          [58.4029, 23.6030],
          [58.3629, 23.6030],
          [58.3629, 23.5730],
        ],
      ],
    },
    compartments: [
      { id: 'C1', capacity: 8000, currentLevel: 7200, percentage: 90 },
      { id: 'C2', capacity: 8000, currentLevel: 6800, percentage: 85 },
      { id: 'C3', capacity: 6000, currentLevel: 5400, percentage: 90 },
      { id: 'C4', capacity: 6000, currentLevel: 4800, percentage: 80 },
    ],
    sensorData: {
      // Muscat (near Royal Opera House/Qurum)
      gps: { lat: 23.5880, lng: 58.3829, speed: 45, heading: 135, timestamp: new Date().toISOString() },
      fuel: { totalFuel: 24200, compartments: [], flowRate: 0.2, timestamp: new Date().toISOString() },
      tilt: { pitch: 2, roll: 1, yaw: 135, timestamp: new Date().toISOString() },
      valve: { drainOpen: false, drainComplete: false, mainValveStatus: 'closed', timestamp: new Date().toISOString() },
    },
    alerts: [],
    route: {
      origin: 'Seeb Industrial Area',
      destination: 'Muttrah Port',
      estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      progress: 65,
    },
  },
  {
    id: 'VHC-002',
    vehicleId: 'VHC-002',
    company: 'Bharat Fuel Services',
    driverName: 'Vikram Singh',
    status: 'active',
    lastSync: new Date().toISOString(),
    geofence: {
      type: 'Polygon',
      // Muttrah / Ruwi  [lng, lat]
      coordinates: [
        [
          [58.5730, 23.5970],
          [58.6130, 23.5970],
          [58.6130, 23.6270],
          [58.5730, 23.6270],
          [58.5730, 23.5970],
        ],
      ],
    },
    compartments: [
      { id: 'C1', capacity: 10000, currentLevel: 9500, percentage: 95 },
      { id: 'C2', capacity: 10000, currentLevel: 9200, percentage: 92 },
      { id: 'C3', capacity: 8000, currentLevel: 7600, percentage: 95 },
      { id: 'C4', capacity: 7000, currentLevel: 6300, percentage: 90 },
    ],
    sensorData: {
      // Muttrah area
      gps: { lat: 23.6120, lng: 58.5930, speed: 52, heading: 90, timestamp: new Date().toISOString() },
      fuel: { totalFuel: 26300, compartments: [], flowRate: 0.1, timestamp: new Date().toISOString() },
      tilt: { pitch: 1, roll: 0, yaw: 90, timestamp: new Date().toISOString() },
      valve: { drainOpen: false, drainComplete: false, mainValveStatus: 'closed', timestamp: new Date().toISOString() },
    },
    alerts: [],
    route: {
      origin: 'Ruwi Depot',
      destination: 'Qurum Fuel Station',
      estimatedArrival: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      progress: 45,
    },
  },
  {
    id: 'VHC-003',
    vehicleId: 'VHC-003',
    company: 'Reliance Transport',
    driverName: 'Amit Kumar',
    status: 'active',
    lastSync: new Date().toISOString(),
    geofence: {
      type: 'Polygon',
      // Seeb  [lng, lat]
      coordinates: [
        [
          [58.1690, 23.6540],
          [58.2090, 23.6540],
          [58.2090, 23.6840],
          [58.1690, 23.6840],
          [58.1690, 23.6540],
        ],
      ],
    },
    compartments: [
      { id: 'C1', capacity: 9000, currentLevel: 8100, percentage: 90 },
      { id: 'C2', capacity: 9000, currentLevel: 7650, percentage: 85 },
      { id: 'C3', capacity: 7000, currentLevel: 6300, percentage: 90 },
      { id: 'C4', capacity: 7000, currentLevel: 5600, percentage: 80 },
    ],
    sensorData: {
      // Seeb
      gps: { lat: 23.6690, lng: 58.1890, speed: 38, heading: 270, timestamp: new Date().toISOString() },
      fuel: { totalFuel: 27650, compartments: [], flowRate: 0.15, timestamp: new Date().toISOString() },
      tilt: { pitch: 1.5, roll: 0.5, yaw: 270, timestamp: new Date().toISOString() },
      valve: { drainOpen: false, drainComplete: false, mainValveStatus: 'closed', timestamp: new Date().toISOString() },
    },
    alerts: [],
    route: {
      origin: 'Seeb Logistics Park',
      destination: 'Muscat Intl Airport Cargo',
      estimatedArrival: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      progress: 55,
    },
  },
  {
    id: 'VHC-004',
    vehicleId: 'VHC-004',
    company: 'IOCL Gujarat',
    driverName: 'Suresh Mehta',
    status: 'idle',
    lastSync: new Date().toISOString(),
    geofence: {
      type: 'Polygon',
      // Barka  [lng, lat]
      coordinates: [
        [
          [57.8690, 23.6930],
          [57.9090, 23.6930],
          [57.9090, 23.7230],
          [57.8690, 23.7230],
          [57.8690, 23.6930],
        ],
      ],
    },
    compartments: [
      { id: 'C1', capacity: 8500, currentLevel: 8500, percentage: 100 },
      { id: 'C2', capacity: 8500, currentLevel: 8500, percentage: 100 },
      { id: 'C3', capacity: 6500, currentLevel: 6500, percentage: 100 },
      { id: 'C4', capacity: 6500, currentLevel: 6500, percentage: 100 },
    ],
    sensorData: {
      // Barka
      gps: { lat: 23.7080, lng: 57.8890, speed: 0, heading: 0, timestamp: new Date().toISOString() },
      fuel: { totalFuel: 30000, compartments: [], flowRate: 0, timestamp: new Date().toISOString() },
      tilt: { pitch: 0, roll: 0, yaw: 0, timestamp: new Date().toISOString() },
      valve: { drainOpen: false, drainComplete: false, mainValveStatus: 'closed', timestamp: new Date().toISOString() },
    },
    alerts: [],
    route: {
      origin: 'Barka Hub',
      destination: 'Sohar Refinery',
      estimatedArrival: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      progress: 0,
    },
  },
  {
    id: 'VHC-005',
    vehicleId: 'VHC-005',
    company: 'HPCL Distribution',
    driverName: 'Pradeep Shah',
    status: 'active',
    lastSync: new Date().toISOString(),
    geofence: {
      type: 'Polygon',
      // Quriyat  [lng, lat]
      coordinates: [
        [
          [58.9240, 23.2470],
          [58.9640, 23.2470],
          [58.9640, 23.2770],
          [58.9240, 23.2770],
          [58.9240, 23.2470],
        ],
      ],
    },
    compartments: [
      { id: 'C1', capacity: 12000, currentLevel: 10800, percentage: 90 },
      { id: 'C2', capacity: 12000, currentLevel: 9600, percentage: 80 },
      { id: 'C3', capacity: 10000, currentLevel: 8500, percentage: 85 },
      { id: 'C4', capacity: 8000, currentLevel: 6400, percentage: 80 },
    ],
    sensorData: {
      // Quriyat
      gps: { lat: 23.2620, lng: 58.9440, speed: 62, heading: 45, timestamp: new Date().toISOString() },
      fuel: { totalFuel: 35300, compartments: [], flowRate: 0.25, timestamp: new Date().toISOString() },
      tilt: { pitch: 2.5, roll: 1, yaw: 45, timestamp: new Date().toISOString() },
      valve: { drainOpen: false, drainComplete: false, mainValveStatus: 'closed', timestamp: new Date().toISOString() },
    },
    alerts: [],
    route: {
      origin: 'Quriyat Terminal',
      destination: 'Sur Distribution Hub',
      estimatedArrival: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
      progress: 75,
    },
  },
];

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: DEMO_VEHICLES,
  selectedVehicleId: null,
  alerts: [],
  isConnected: true,

  setVehicles: (vehicles) => set({ vehicles }),

  updateVehicle: (vehicleId, data) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === vehicleId ? { ...v, ...data } : v)),
    })),

  selectVehicle: (vehicleId) => set({ selectedVehicleId: vehicleId }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 50), // Keep last 50 alerts
      vehicles: state.vehicles.map((v) =>
        v.id === alert.vehicleId ? { ...v, alerts: [alert, ...v.alerts].slice(0, 10) } : v
      ),
    })),

  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
      vehicles: state.vehicles.map((v) => ({
        ...v,
        alerts: v.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
      })),
    })),

  setConnectionStatus: (connected) => set({ isConnected: connected }),

  getVehicleById: (id) => get().vehicles.find((v) => v.id === id),

  getVehiclesByRole: (role, assignedIds) => {
    const { vehicles } = get();
    if (role === 'manager') return vehicles;
    return vehicles.filter((v) => assignedIds.includes(v.id));
  },
}));
