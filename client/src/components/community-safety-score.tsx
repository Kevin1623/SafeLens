import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Heart, 
  Users, 
  MapPin, 
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Award,
  Home,
  Car,
  Camera,
  Phone,
  Building,
  RefreshCw
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from "recharts";

interface SafetyMetric {
  name: string;
  score: number; // 0-100
  weight: number; // importance weight
  trend: 'up' | 'down' | 'stable';
  description: string;
  lastUpdated: Date;
}

interface DistrictSafetyScore {
  id: string;
  name: string;
  region: string;
  population: number;
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  rank: number;
  metrics: {
    crimeRate: SafetyMetric;
    responseTime: SafetyMetric;
    communityEngagement: SafetyMetric;
    infrastructure: SafetyMetric;
    publicSentiment: SafetyMetric;
    economicSafety: SafetyMetric;
  };
  improvements: string[];
  achievements: string[];
  riskFactors: string[];
  monthlyTrend: Array<{ month: string; score: number }>;
}

interface SafetyInsight {
  id: string;
  district: string;
  type: 'improvement' | 'concern' | 'achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
}

interface CommunitySafetyScoreProps {
  className?: string;
}

export function CommunitySafetyScore({ className = "" }: CommunitySafetyScoreProps) {
  const [districts, setDistricts] = useState<DistrictSafetyScore[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [insights, setInsights] = useState<SafetyInsight[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'population' | 'name'>('score');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock data generator
  const generateSafetyScores = (): DistrictSafetyScore[] => {
    const districtNames = [
      { name: 'Anna Nagar', region: 'North', population: 325000 },
      { name: 'T.Nagar', region: 'Central', population: 280000 },
      { name: 'Velachery', region: 'South', population: 195000 },
      { name: 'Adyar', region: 'South', population: 210000 },
      { name: 'Tambaram', region: 'South', population: 185000 },
      { name: 'Mylapore', region: 'Central', population: 165000 },
      { name: 'Perungudi', region: 'South', population: 145000 },
      { name: 'Chrompet', region: 'South', population: 125000 }
    ];

    const grades: Array<'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D'> = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D'];
    const trends: Array<'up' | 'down' | 'stable'> = ['up', 'down', 'stable'];

    return districtNames.map((district, index) => {
      const crimeScore = Math.floor(Math.random() * 40) + 60;
      const responseScore = Math.floor(Math.random() * 35) + 65;
      const engagementScore = Math.floor(Math.random() * 30) + 70;
      const infraScore = Math.floor(Math.random() * 25) + 75;
      const sentimentScore = Math.floor(Math.random() * 30) + 70;
      const economicScore = Math.floor(Math.random() * 35) + 65;

      const overallScore = Math.round(
        (crimeScore * 0.25 + responseScore * 0.2 + engagementScore * 0.15 + 
         infraScore * 0.15 + sentimentScore * 0.15 + economicScore * 0.1)
      );

      const getGrade = (score: number) => {
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 85) return 'B+';
        if (score >= 80) return 'B';
        if (score >= 75) return 'C+';
        if (score >= 70) return 'C';
        return 'D';
      };

      return {
        id: `district-${index}`,
        name: district.name,
        region: district.region,
        population: district.population,
        overallScore,
        grade: getGrade(overallScore),
        rank: index + 1,
        metrics: {
          crimeRate: {
            name: 'Crime Rate',
            score: crimeScore,
            weight: 25,
            trend: trends[Math.floor(Math.random() * 3)],
            description: 'Based on incidents per capita',
            lastUpdated: new Date()
          },
          responseTime: {
            name: 'Response Time',
            score: responseScore,
            weight: 20,
            trend: trends[Math.floor(Math.random() * 3)],
            description: 'Average emergency response time',
            lastUpdated: new Date()
          },
          communityEngagement: {
            name: 'Community Engagement',
            score: engagementScore,
            weight: 15,
            trend: trends[Math.floor(Math.random() * 3)],
            description: 'Public participation in safety programs',
            lastUpdated: new Date()
          },
          infrastructure: {
            name: 'Infrastructure',
            score: infraScore,
            weight: 15,
            trend: trends[Math.floor(Math.random() * 3)],
            description: 'CCTV, lighting, emergency systems',
            lastUpdated: new Date()
          },
          publicSentiment: {
            name: 'Public Sentiment',
            score: sentimentScore,
            weight: 15,
            trend: trends[Math.floor(Math.random() * 3)],
            description: 'Social media and survey feedback',
            lastUpdated: new Date()
          },
          economicSafety: {
            name: 'Economic Safety',
            score: economicScore,
            weight: 10,
            trend: trends[Math.floor(Math.random() * 3)],
            description: 'Economic crime and fraud rates',
            lastUpdated: new Date()
          }
        },
        improvements: [
          'Increase CCTV coverage',
          'Improve street lighting',
          'Enhance community policing',
          'Faster response systems'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        achievements: [
          'Reduced crime rate',
          'Improved community trust',
          'Better infrastructure',
          'Active citizen participation'
        ].slice(0, Math.floor(Math.random() * 2) + 1),
        riskFactors: [
          'High foot traffic',
          'Commercial activity',
          'Transport hub',
          'Entertainment district'
        ].slice(0, Math.floor(Math.random() * 2) + 1),
        monthlyTrend: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
          score: overallScore + (Math.random() - 0.5) * 10
        }))
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  };

  const generateInsights = (districts: DistrictSafetyScore[]): SafetyInsight[] => {
    const insights: SafetyInsight[] = [];
    
    districts.forEach((district, index) => {
      // Generate insights based on scores
      if (district.overallScore > 85) {
        insights.push({
          id: `insight-${index}-1`,
          district: district.name,
          type: 'achievement',
          title: 'Excellent Safety Performance',
          description: `${district.name} maintains high safety standards with strong community engagement`,
          impact: 'high',
          actionRequired: false
        });
      }
      
      if (district.metrics.crimeRate.score < 70) {
        insights.push({
          id: `insight-${index}-2`,
          district: district.name,
          type: 'concern',
          title: 'Crime Rate Above Average',
          description: `Increased vigilance needed in ${district.name} due to rising crime incidents`,
          impact: 'high',
          actionRequired: true
        });
      }
      
      if (district.metrics.responseTime.trend === 'up') {
        insights.push({
          id: `insight-${index}-3`,
          district: district.name,
          type: 'improvement',
          title: 'Response Time Improving',
          description: `Emergency response times in ${district.name} have shown consistent improvement`,
          impact: 'medium',
          actionRequired: false
        });
      }
    });

    return insights.slice(0, 8);
  };

  // Initialize data
  useEffect(() => {
    const districtData = generateSafetyScores();
    setDistricts(districtData);
    setInsights(generateInsights(districtData));
  }, []);

  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const districtData = generateSafetyScores();
      setDistricts(districtData);
      setInsights(generateInsights(districtData));
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-green-500 text-white';
      case 'A':
        return 'bg-green-400 text-white';
      case 'B+':
        return 'bg-blue-500 text-white';
      case 'B':
        return 'bg-blue-400 text-white';
      case 'C+':
        return 'bg-yellow-500 text-black';
      case 'C':
        return 'bg-yellow-400 text-black';
      case 'D':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="w-4 h-4 text-green-500" />;
      case 'concern':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'improvement':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-green-50 border-green-200';
      case 'concern':
        return 'bg-red-50 border-red-200';
      case 'improvement':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Sort districts
  const sortedDistricts = useMemo(() => {
    const sorted = [...districts];
    switch (sortBy) {
      case 'score':
        return sorted.sort((a, b) => b.overallScore - a.overallScore);
      case 'population':
        return sorted.sort((a, b) => b.population - a.population);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [districts, sortBy]);

  // Filter districts
  const filteredDistricts = selectedDistrict === 'all' 
    ? sortedDistricts 
    : sortedDistricts.filter(d => d.id === selectedDistrict);

  // Chart data for overview
  const overviewData = useMemo(() => {
    return districts.map(district => ({
      name: district.name,
      score: district.overallScore,
      grade: district.grade,
      population: district.population / 1000 // in thousands
    }));
  }, [districts]);

  const avgScore = Math.round(districts.reduce((acc, d) => acc + d.overallScore, 0) / districts.length || 0);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Community Safety Score
            </h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive safety assessment for Chennai districts
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">By Score</SelectItem>
              <SelectItem value="population">By Population</SelectItem>
              <SelectItem value="name">By Name</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-6 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Last Updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          <span>Average Score: {avgScore}/100</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{districts.length} Districts Monitored</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="districts">Districts</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-4">District Safety Scores</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overviewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-4">Top Performing Districts</h4>
              <ScrollArea className="h-72">
                <div className="space-y-3">
                  {sortedDistricts.slice(0, 6).map((district, index) => (
                    <div key={district.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{district.name}</div>
                          <div className="text-xs text-muted-foreground">{district.region} Chennai</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getGradeColor(district.grade)}>
                          {district.grade}
                        </Badge>
                        <span className="text-sm font-medium">{district.overallScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Highest Score</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {districts[0]?.overallScore || 0}
              </div>
              <div className="text-xs text-muted-foreground">{districts[0]?.name}</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="font-medium">Avg Score</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {avgScore}
              </div>
              <div className="text-xs text-muted-foreground">All districts</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Improving</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {districts.filter(d => Object.values(d.metrics).some(m => m.trend === 'up')).length}
              </div>
              <div className="text-xs text-muted-foreground">Districts</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="font-medium">Needs Attention</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {districts.filter(d => d.overallScore < 75).length}
              </div>
              <div className="text-xs text-muted-foreground">Districts</div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="districts" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredDistricts.map((district) => (
                <Card key={district.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg text-foreground">{district.name}</h4>
                        <Badge className={getGradeColor(district.grade)}>
                          Grade {district.grade}
                        </Badge>
                        <Badge variant="secondary">
                          Rank #{district.rank}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {district.region} Chennai • Population: {district.population.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {district.overallScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Safety Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {Object.entries(district.metrics).map(([key, metric]) => (
                      <div key={key} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{metric.name}</span>
                          {getTrendIcon(metric.trend)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Score</span>
                            <span className="font-medium">{metric.score}/100</span>
                          </div>
                          <Progress value={metric.score} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <h5 className="font-medium text-foreground mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Achievements
                      </h5>
                      <ul className="space-y-1">
                        {district.achievements.map((achievement, index) => (
                          <li key={index} className="text-muted-foreground">• {achievement}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-foreground mb-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-blue-500" />
                        Improvements Needed
                      </h5>
                      <ul className="space-y-1">
                        {district.improvements.map((improvement, index) => (
                          <li key={index} className="text-muted-foreground">• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-foreground mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        Risk Factors
                      </h5>
                      <ul className="space-y-1">
                        {district.riskFactors.map((factor, index) => (
                          <li key={index} className="text-muted-foreground">• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {districts[0] && (
              <div>
                <h4 className="font-medium text-foreground mb-4">Metric Breakdown - {districts[0].name}</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={[
                    { name: 'Crime Rate', value: districts[0].metrics.crimeRate.score, fill: '#8884d8' },
                    { name: 'Response Time', value: districts[0].metrics.responseTime.score, fill: '#82ca9d' },
                    { name: 'Community', value: districts[0].metrics.communityEngagement.score, fill: '#ffc658' },
                    { name: 'Infrastructure', value: districts[0].metrics.infrastructure.score, fill: '#ff7300' }
                  ]}>
                    <RadialBar dataKey="value" cornerRadius={4} />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div>
              <h4 className="font-medium text-foreground mb-4">Safety Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={districts[0]?.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-center">
            {['Crime Rate', 'Response Time', 'Community Engagement', 'Infrastructure', 'Public Sentiment', 'Economic Safety'].map((metric, index) => {
              const avgMetricScore = Math.round(districts.reduce((acc, d) => {
                const metricKey = metric.toLowerCase().replace(' ', '').replace(' ', '') as keyof typeof d.metrics;
                return acc + (d.metrics[metricKey as keyof typeof d.metrics]?.score || 0);
              }, 0) / districts.length);

              return (
                <Card key={metric} className="p-4">
                  <div className="font-medium text-sm mb-2">{metric}</div>
                  <div className="text-2xl font-bold text-foreground mb-1">{avgMetricScore}</div>
                  <div className="text-xs text-muted-foreground">District Average</div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className={`p-4 border rounded-lg ${getInsightColor(insight.type)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getInsightIcon(insight.type)}
                    <div>
                      <div className="font-medium text-foreground text-sm mb-1">
                        {insight.title}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {insight.district} • {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {insight.description}
                      </div>
                    </div>
                  </div>
                  {insight.actionRequired && (
                    <Badge variant="destructive" className="text-xs">
                      Action Required
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center py-8">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium text-foreground mb-2">Community Safety Insights</h4>
            <p className="text-sm text-muted-foreground">
              AI-powered analysis of community safety factors across Chennai districts
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
