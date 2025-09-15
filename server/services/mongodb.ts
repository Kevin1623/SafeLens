import mongoose from 'mongoose';

// Define the crime data schema based on your MongoDB collection
const CrimeDataSchema = new mongoose.Schema({
  incident_id: { type: Number, required: true },
  date: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  crime_type: { type: String, required: true },
  severity: { type: String, required: true },
  ward: { type: String, required: true },
  description: { type: String, required: true }
}, { collection: 'crime_data' });

const CrimeData = mongoose.model('CrimeData', CrimeDataSchema);

class MongoDBService {
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('MongoDB already connected');
      return;
    }

    try {
      const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vaishakhp11:PiPa7LUEZ5ufQo8z@cluster0.toscmfj.mongodb.net/test';
      
      await mongoose.connect(MONGODB_URI);
      this.isConnected = true;
      console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ MongoDB disconnection error:', error);
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!mongoose.connection.db) {
        return false;
      }
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB connection test failed:', error);
      return false;
    }
  }

  // Crime data methods
  async getCrimeData(filters: {
    crimeType?: string;
    severity?: string;
    ward?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  } = {}): Promise<any[]> {
    try {
      const query: any = {};
      
      if (filters.crimeType) {
        query.crime_type = { $regex: filters.crimeType, $options: 'i' };
      }
      
      if (filters.severity) {
        query.severity = filters.severity;
      }
      
      if (filters.ward) {
        query.ward = { $regex: filters.ward, $options: 'i' };
      }
      
      if (filters.dateFrom || filters.dateTo) {
        query.date = {};
        if (filters.dateFrom) {
          query.date.$gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          query.date.$lte = filters.dateTo;
        }
      }

      const limit = filters.limit || 1000;
      const data = await CrimeData.find(query).limit(limit);
      return data;
    } catch (error) {
      console.error('Error fetching crime data:', error);
      throw error;
    }
  }

  async getCrimeStatsByDistrict(): Promise<any[]> {
    try {
      // First get ward-level data
      const wardStats = await this.getCrimeStatsByWard();
      
      // Then aggregate by district using the ward mapping
      const districtStatsMap = new Map();
      
      wardStats.forEach(wardStat => {
        const districtInfo = this.getDistrictFromWard(wardStat.ward);
        const districtKey = districtInfo.district;
        
        if (!districtStatsMap.has(districtKey)) {
          districtStatsMap.set(districtKey, {
            ward: districtInfo.district,
            district: districtInfo.district,
            region: districtInfo.region,
            population: 0,
            totalIncidents: 0,
            crimeTypes: new Set(),
            severityCounts: [],
            avgLatitude: [],
            avgLongitude: [],
            highSeverityCount: 0,
            mediumSeverityCount: 0,
            lowSeverityCount: 0
          });
        }
        
        const districtStat = districtStatsMap.get(districtKey);
        districtStat.population += districtInfo.population;
        districtStat.totalIncidents += wardStat.totalIncidents;
        wardStat.crimeTypes.forEach(type => districtStat.crimeTypes.add(type));
        districtStat.severityCounts.push(...wardStat.severityCounts);
        districtStat.avgLatitude.push(wardStat.avgLatitude);
        districtStat.avgLongitude.push(wardStat.avgLongitude);
        districtStat.highSeverityCount += wardStat.highSeverityCount;
        districtStat.mediumSeverityCount += wardStat.mediumSeverityCount;
        districtStat.lowSeverityCount += wardStat.lowSeverityCount;
      });
      
      // Convert map to array and calculate averages
      const result = Array.from(districtStatsMap.values()).map(stat => ({
        ...stat,
        crimeTypes: Array.from(stat.crimeTypes),
        avgLatitude: stat.avgLatitude.reduce((sum, val) => sum + val, 0) / stat.avgLatitude.length,
        avgLongitude: stat.avgLongitude.reduce((sum, val) => sum + val, 0) / stat.avgLongitude.length
      }));
      
      return result.sort((a, b) => b.totalIncidents - a.totalIncidents);
    } catch (error) {
      console.error('Error fetching crime stats by district:', error);
      throw error;
    }
  }

  // Helper method to get district from ward (matching server route mapping)
  private getDistrictFromWard(ward: string) {
    const WARD_TO_DISTRICT_MAPPING: Record<string, { district: string; region: string; population: number }> = {
      // Central Chennai Districts
      'Ward-1': { district: 'Central Chennai', region: 'Central', population: 45000 },
      'Ward-2': { district: 'Central Chennai', region: 'Central', population: 42000 },
      'Ward-3': { district: 'Central Chennai', region: 'Central', population: 38000 },
      'Ward-4': { district: 'Anna Nagar', region: 'Central', population: 35000 },
      'Ward-5': { district: 'Anna Nagar', region: 'Central', population: 40000 },
      'Ward-6': { district: 'Anna Nagar', region: 'Central', population: 37000 },
      'Ward-7': { district: 'T.Nagar', region: 'Central', population: 32000 },
      'Ward-8': { district: 'T.Nagar', region: 'Central', population: 28000 },
      'Ward-9': { district: 'T.Nagar', region: 'Central', population: 30000 },
      'Ward-10': { district: 'T.Nagar', region: 'Central', population: 33000 },
      'Ward-11': { district: 'North Chennai', region: 'North', population: 48000 },
      'Ward-12': { district: 'North Chennai', region: 'North', population: 52000 },
      'Ward-13': { district: 'North Chennai', region: 'North', population: 46000 },
      'Ward-14': { district: 'North Chennai', region: 'North', population: 44000 },
      'Ward-15': { district: 'Avadi', region: 'North', population: 38000 },
      'Ward-16': { district: 'Avadi', region: 'North', population: 41000 },
      'Ward-17': { district: 'Avadi', region: 'North', population: 39000 },
      'Ward-18': { district: 'South Chennai', region: 'South', population: 55000 },
      'Ward-19': { district: 'South Chennai', region: 'South', population: 58000 },
      'Ward-20': { district: 'South Chennai', region: 'South', population: 53000 },
      'Ward-21': { district: 'South Chennai', region: 'South', population: 49000 },
      'Ward-22': { district: 'Velachery', region: 'South', population: 43000 },
      'Ward-23': { district: 'Velachery', region: 'South', population: 47000 },
      'Ward-24': { district: 'Velachery', region: 'South', population: 45000 },
      'Ward-25': { district: 'Tambaram', region: 'South', population: 42000 },
      'Ward-26': { district: 'Tambaram', region: 'South', population: 46000 },
      'Ward-27': { district: 'Tambaram', region: 'South', population: 44000 },
      'Ward-28': { district: 'Central Chennai', region: 'Central', population: 36000 },
      'Ward-29': { district: 'Anna Nagar', region: 'Central', population: 34000 },
      'Ward-30': { district: 'North Chennai', region: 'North', population: 51000 },
      'Ward-31': { district: 'South Chennai', region: 'South', population: 56000 },
      'Ward-32': { district: 'Velachery', region: 'South', population: 48000 },
      'Ward-33': { district: 'Tambaram', region: 'South', population: 43000 },
      'Ward-34': { district: 'Avadi', region: 'North', population: 40000 },
      'Ward-35': { district: 'T.Nagar', region: 'Central', population: 31000 },
    };
    return WARD_TO_DISTRICT_MAPPING[ward] || { district: 'Unknown District', region: 'Chennai', population: 35000 };
  }

  // Original ward-level stats method (for internal use)
  async getCrimeStatsByWard(): Promise<any[]> {
    try {
      const pipeline = [
        {
          $group: {
            _id: '$ward',
            totalIncidents: { $sum: 1 },
            crimeTypes: { $addToSet: '$crime_type' },
            severityCounts: {
              $push: '$severity'
            },
            avgLatitude: { $avg: '$latitude' },
            avgLongitude: { $avg: '$longitude' }
          }
        },
        {
          $project: {
            ward: '$_id',
            totalIncidents: 1,
            crimeTypes: 1,
            severityCounts: 1,
            avgLatitude: 1,
            avgLongitude: 1,
            highSeverityCount: {
              $size: {
                $filter: {
                  input: '$severityCounts',
                  cond: { $eq: ['$$this', 'high'] }
                }
              }
            },
            mediumSeverityCount: {
              $size: {
                $filter: {
                  input: '$severityCounts',
                  cond: { $eq: ['$$this', 'medium'] }
                }
              }
            },
            lowSeverityCount: {
              $size: {
                $filter: {
                  input: '$severityCounts',
                  cond: { $eq: ['$$this', 'low'] }
                }
              }
            }
          }
        },
        {
          $sort: { totalIncidents: -1 as const }
        }
      ];

      const stats = await CrimeData.aggregate(pipeline);
      return stats;
    } catch (error) {
      console.error('Error fetching crime stats by ward:', error);
      throw error;
    }
  }

  async getCrimeStatsByType(): Promise<any[]> {
    try {
      const pipeline = [
        {
          $group: {
            _id: '$crime_type',
            totalIncidents: { $sum: 1 },
            wards: { $addToSet: '$ward' },
            severityCounts: {
              $push: '$severity'
            }
          }
        },
        {
          $project: {
            crimeType: '$_id',
            totalIncidents: 1,
            wards: 1,
            severityCounts: 1,
            highSeverityCount: {
              $size: {
                $filter: {
                  input: '$severityCounts',
                  cond: { $eq: ['$$this', 'high'] }
                }
              }
            },
            mediumSeverityCount: {
              $size: {
                $filter: {
                  input: '$severityCounts',
                  cond: { $eq: ['$$this', 'medium'] }
                }
              }
            },
            lowSeverityCount: {
              $size: {
                $filter: {
                  input: '$severityCounts',
                  cond: { $eq: ['$$this', 'low'] }
                }
              }
            }
          }
        },
        {
          $sort: { totalIncidents: -1 as const }
        }
      ];

      const stats = await CrimeData.aggregate(pipeline);
      return stats;
    } catch (error) {
      console.error('Error fetching crime stats by type:', error);
      throw error;
    }
  }

  async getCrimeHotspots(limit: number = 10): Promise<any[]> {
    try {
      const pipeline = [
        {
          $group: {
            _id: {
              latitude: { $round: ['$latitude', 3] },
              longitude: { $round: ['$longitude', 3] }
            },
            incidentCount: { $sum: 1 },
            crimeTypes: { $addToSet: '$crime_type' },
            severityCounts: { $push: '$severity' },
            wards: { $addToSet: '$ward' }
          }
        },
        {
          $project: {
            latitude: '$_id.latitude',
            longitude: '$_id.longitude',
            incidentCount: 1,
            crimeTypes: 1,
            severityCounts: 1,
            wards: 1,
            highSeverityCount: {
              $size: {
                $filter: {
                  input: '$severityCounts',
                  cond: { $eq: ['$$this', 'high'] }
                }
              }
            }
          }
        },
        {
          $sort: { incidentCount: -1 as const }
        },
        {
          $limit: limit
        }
      ];

      const hotspots = await CrimeData.aggregate(pipeline);
      return hotspots;
    } catch (error) {
      console.error('Error fetching crime hotspots:', error);
      throw error;
    }
  }

  async getTotalCrimeCount(): Promise<number> {
    try {
      return await CrimeData.countDocuments();
    } catch (error) {
      console.error('Error fetching total crime count:', error);
      throw error;
    }
  }

  async getCrimeDataForMap(filters: {
    crimeType?: string;
    severity?: string;
    ward?: string;
    limit?: number;
  } = {}): Promise<any[]> {
    try {
      const query: any = {};
      
      if (filters.crimeType) {
        query.crime_type = { $regex: filters.crimeType, $options: 'i' };
      }
      
      if (filters.severity) {
        query.severity = filters.severity;
      }
      
      if (filters.ward) {
        query.ward = { $regex: filters.ward, $options: 'i' };
      }

      const limit = filters.limit || 5000; // Limit for map performance
      const data = await CrimeData.find(query, {
        latitude: 1,
        longitude: 1,
        crime_type: 1,
        severity: 1,
        ward: 1,
        description: 1,
        date: 1
      }).limit(limit);
      
      return data;
    } catch (error) {
      console.error('Error fetching crime data for map:', error);
      throw error;
    }
  }
}

export const mongoDBService = new MongoDBService();
