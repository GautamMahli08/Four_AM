import { useEffect, useRef } from 'react';
import { useVehicleStore, Alert } from '@/store/useVehicleStore';

const ALERT_TYPES = [
  { type: 'theft', severity: 'critical', title: 'Fuel Theft Detected', message: 'Rapid fuel loss detected in compartment C2' },
  { type: 'route_violation', severity: 'warning', title: 'Route Deviation', message: 'Vehicle deviated from planned route' },
  { type: 'sensor_health', severity: 'info', title: 'Sensor Maintenance', message: 'GPS sensor requires calibration' },
  { type: 'maintenance', severity: 'warning', title: 'Scheduled Maintenance', message: 'Vehicle due for inspection in 2 days' }
] as const;

export function useSimulation() {
  const { vehicles, updateVehicle, addAlert } = useVehicleStore();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      vehicles.forEach((vehicle, index) => {
        // Enhanced movement with faster, more obvious changes
        const currentLat = vehicle.sensorData.gps.lat;
        const currentLng = vehicle.sensorData.gps.lng;
        
        // Create extended route patterns for each vehicle
        const routePatterns = [
          { latSpeed: 0.0008, lngSpeed: 0.0012 }, // VHC-001: SE direction
          { latSpeed: -0.0006, lngSpeed: 0.0010 }, // VHC-002: NE direction  
          { latSpeed: 0.0010, lngSpeed: -0.0008 }, // VHC-003: NW direction
          { latSpeed: 0.0001, lngSpeed: 0.0001 }, // VHC-004: minimal (idle)
          { latSpeed: -0.0012, lngSpeed: 0.0006 }  // VHC-005: complex pattern
        ];
        
        const pattern = routePatterns[index] || routePatterns[0];
        
        // Add time-based variation for more realistic movement
        const timeOffset = (Date.now() / 10000) + (index * Math.PI / 2);
        const latVariation = Math.sin(timeOffset) * 0.0003;
        const lngVariation = Math.cos(timeOffset) * 0.0003;
        
        const newLat = currentLat + pattern.latSpeed + latVariation;
        const newLng = currentLng + pattern.lngSpeed + lngVariation;
        
        // Dynamic speed changes based on movement
        const baseSpeed = vehicle.status === 'idle' ? 0 : 35 + (index * 5);
        const speedVariation = Math.sin(timeOffset * 2) * 15 + Math.random() * 10;
        const newSpeed = Math.max(0, Math.min(80, baseSpeed + speedVariation));
        
        // Fuel consumption based on speed and distance
        const distanceMoved = Math.sqrt(
          Math.pow(pattern.latSpeed * 111000, 2) + 
          Math.pow(pattern.lngSpeed * 111000, 2)
        );
        const fuelConsumption = (distanceMoved * 0.3) + (newSpeed * 0.02); // More realistic consumption
        
        const currentFuel = vehicle.sensorData.fuel.totalFuel;
        const newTotalFuel = Math.max(0, currentFuel - fuelConsumption);
        
        // Update compartments proportionally with slight variations
        const fuelRatio = newTotalFuel / Math.max(currentFuel, 1);
        const updatedCompartments = vehicle.compartments.map((comp, compIndex) => {
          const variation = (Math.random() - 0.5) * 0.02; // ±1% variation per compartment
          const newLevel = Math.max(0, comp.currentLevel * (fuelRatio + variation));
          return {
            ...comp,
            currentLevel: Math.round(newLevel),
            percentage: Math.round((newLevel / comp.capacity) * 100 * 100) / 100
          };
        });

        // Heading follows movement direction
        const headingFromMovement = Math.atan2(pattern.lngSpeed, pattern.latSpeed) * (180 / Math.PI);
        const newHeading = (headingFromMovement + 90 + 360) % 360;

        // Dynamic tilt based on movement and speed
        const speedFactor = newSpeed / 80;
        const pitch = (Math.sin(timeOffset * 3) * 3 + Math.random() * 2) * speedFactor;
        const roll = (Math.cos(timeOffset * 2.5) * 2 + Math.random() * 1.5) * speedFactor;

        // Update route progress dynamically
        const currentProgress = vehicle.route?.progress || 0;
        const progressIncrement = vehicle.status === 'active' ? Math.random() * 0.5 : 0;
        const newProgress = Math.min(100, currentProgress + progressIncrement);

        updateVehicle(vehicle.id, {
          compartments: updatedCompartments,
          sensorData: {
            ...vehicle.sensorData,
            gps: {
              ...vehicle.sensorData.gps,
              lat: Math.round(newLat * 10000) / 10000,
              lng: Math.round(newLng * 10000) / 10000,
              speed: Math.round(newSpeed),
              heading: Math.round(newHeading),
              timestamp: new Date().toISOString()
            },
            fuel: {
              ...vehicle.sensorData.fuel,
              totalFuel: Math.round(newTotalFuel),
              compartments: updatedCompartments,
              flowRate: Math.round((fuelConsumption / 2) * 100) / 100, // L/min
              timestamp: new Date().toISOString()
            },
            tilt: {
              ...vehicle.sensorData.tilt,
              pitch: Math.round(pitch * 100) / 100,
              roll: Math.round(roll * 100) / 100,
              yaw: Math.round(newHeading),
              timestamp: new Date().toISOString()
            },
            valve: {
              ...vehicle.sensorData.valve,
              timestamp: new Date().toISOString()
            }
          },
          route: vehicle.route ? {
            ...vehicle.route,
            progress: Math.round(newProgress * 100) / 100
          } : undefined,
          lastSync: new Date().toISOString()
        });

        // Enhanced alert generation with more variety
        if (Math.random() < 0.015) { // 1.5% chance per update
          const alertTemplate = ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];
          const alert: Alert = {
            id: `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            vehicleId: vehicle.id,
            type: alertTemplate.type,
            severity: alertTemplate.severity,
            title: alertTemplate.title,
            message: `${alertTemplate.message} - Vehicle: ${vehicle.vehicleId}`,
            timestamp: new Date().toISOString(),
            acknowledged: false,
            ruleId: `RULE-${alertTemplate.type.toUpperCase()}`,
            snapshot: {
              fuel: vehicle.sensorData.fuel,
              gps: { lat: newLat, lng: newLng, speed: newSpeed },
              tilt: { pitch, roll, yaw: newHeading }
            }
          };
          addAlert(alert);
        }
      });
    }, 1000); // Update every 1 second for faster movement

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [vehicles, updateVehicle, addAlert]);

  return null;
}