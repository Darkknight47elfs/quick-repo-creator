import { useState, useEffect } from 'react';
import { Line, Radar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { useParams } from 'react-router-dom';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  AlertTriangle, 
  Droplet, 
  Leaf, 
  Sun, 
  Sprout, 
  CloudRain, 
  Thermometer 
} from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

interface CropData {
  [key: string]: any;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

interface RadarData {
  labels: string[];
  datasets: any[];
}

const CropPerformanceDashboard: React.FC = () => {
  const { farmerId, farmId } = useParams<{ farmerId: string; farmId: string }>();
  const [data, setData] = useState<CropData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeParameter, setActiveParameter] = useState<string>('ndvi');
  const [trendData, setTrendData] = useState<ChartData | null>(null);
  const [radarData, setRadarData] = useState<RadarData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('token');
      try {
        const response = await fetch(
          `${API_BASE_URL}/analyze/crop-dash/${farmerId}/farm/${farmId}/`,
          {
            headers: {
              Authorization: `Token ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const jsonData = await response.json();
        setData(jsonData);
        prepareChartData(jsonData, activeParameter);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [farmerId, farmId]);

  const prepareChartData = (apiData, activeParam) => {
    if (!apiData || apiData.length === 0) return;

    const labels = apiData.map((item, index) => `Week ${index + 1}`);
    const activeData = apiData.map((item) => item[activeParam]);

    // Colors based on parameter
    const colors = {
      ndvi: { border: '#2e7d32', bg: 'rgba(46, 125, 50, 0.2)' },
      ndre: { border: '#1565c0', bg: 'rgba(21, 101, 192, 0.2)' },
      ndmi: { border: '#0277bd', bg: 'rgba(2, 119, 189, 0.2)' },
      ndwi: { border: '#00838f', bg: 'rgba(0, 131, 143, 0.2)' },
      ci: { border: '#558b2f', bg: 'rgba(85, 139, 47, 0.2)' }
    };

    const selectedColor = colors[activeParam] || colors.ndvi;

    setTrendData({
      labels,
      datasets: [
        {
          label: activeParam.toUpperCase(),
          data: activeData,
          borderColor: selectedColor.border,
          backgroundColor: selectedColor.bg,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: selectedColor.border,
        },
      ],
    });

    // Prepare radar data
    const latestData = apiData[0];
    setRadarData({
      labels: ['NDVI', 'NDRE', 'NDMI', 'NDWI', 'CI'],
      datasets: [
        {
          label: 'Current Values',
          data: [
            latestData.ndvi * 100,
            latestData.ndre * 100,
            latestData.ndmi * 100,
            latestData.ndwi * 100,
            latestData.ci * 100,
          ],
          fill: true,
          backgroundColor: 'rgba(44, 119, 68, 0.2)',
          borderColor: '#2c7744',
          pointBackgroundColor: '#2c7744',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#2c7744',
          pointRadius: 5,
        },
      ],
    });
  };

  const handleParameterClick = (parameter) => {
    setActiveParameter(parameter);
    prepareChartData(data, parameter);
  };

  const getParameterIcon = (param) => {
    switch (param) {
      case 'ndvi': return <Sprout className="mr-2" size={20} />;
      case 'ndre': return <Leaf className="mr-2" size={20} />;
      case 'ndmi': return <Droplet className="mr-2" size={20} />;
      case 'ndwi': return <CloudRain className="mr-2" size={20} />;
      case 'ci': return <Sun className="mr-2" size={20} />;
      default: return null;
    }
  };

  const getStatusIcon = (status, changeValue) => {
    if (status?.toLowerCase() === 'good') {
      return <ArrowUpCircle size={20} className="text-green-600" />;
    } else if (status?.toLowerCase() === 'bad') {
      return <ArrowDownCircle size={20} className="text-red-600" />;
    } else {
      return <AlertTriangle size={20} className="text-amber-600" />;
    }
  };

  const StatCard = ({ title, value, status, parameter, statusText, changeValue }) => {
    // Custom background colors based on parameter
    const bgColors = {
      ndvi: 'bg-gradient-to-br from-green-50 to-emerald-100',
      ndre: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      ndmi: 'bg-gradient-to-br from-cyan-50 to-blue-100',
      ndwi: 'bg-gradient-to-br from-teal-50 to-cyan-100',
      ci: 'bg-gradient-to-br from-lime-50 to-green-100',
    };

    const borderColors = {
      ndvi: 'border-green-600',
      ndre: 'border-blue-600',
      ndmi: 'border-cyan-600',
      ndwi: 'border-teal-600',
      ci: 'border-lime-600',
    };

    return (
      <div
        className={`transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl ${
          activeParameter === parameter ? 'border-2 transform scale-105' : 'border border-gray-200'
        } ${activeParameter === parameter ? borderColors[parameter] : ''} ${bgColors[parameter]}`}
        onClick={() => handleParameterClick(parameter)}
        style={{ cursor: 'pointer' }}
      >
        <div className="p-4">
          <div className="flex items-center mb-2 text-gray-700">
            {getParameterIcon(parameter)}
            <span className="font-medium">{title}</span>
          </div>
          
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-gray-800">
              {Number(value).toFixed(2)}
            </div>
            
            {changeValue !== undefined && (
              <div className={`flex items-center text-sm font-medium ${
                changeValue >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeValue >= 0 ? (
                  <ArrowUpCircle size={16} className="mr-1" />
                ) : (
                  <ArrowDownCircle size={16} className="mr-1" />
                )}
                {Math.abs(Number(changeValue)).toFixed(2)}
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              status?.toLowerCase() === 'good' ? 'bg-green-100 text-green-800' :
              status?.toLowerCase() === 'average' ? 'bg-amber-100 text-amber-800' :
              'bg-red-100 text-red-800'
            }`}>
              {getStatusIcon(status, changeValue)}
              <span className="ml-1">{statusText}</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-t-2 border-b-2 border-green-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 m-4 text-red-800 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center">
          <AlertTriangle className="mr-2" />
          <span className="font-medium">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 m-4 text-blue-800 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center">
          <AlertTriangle className="mr-2" />
          <span className="font-medium">No data available for this farm.</span>
        </div>
      </div>
    );
  }

  const latestData = data[0];
  const getHealthColor = (health) => {
    if (health?.toLowerCase().includes('good')) return 'bg-green-600';
    if (health?.toLowerCase().includes('average')) return 'bg-amber-500';
    return 'bg-red-600';
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 shadow-lg bg-gradient-to-r from-green-800 to-emerald-700 rounded-2xl">
          <div className="p-6">
            <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">Crop Performance Dashboard</h1>
                <div className="flex flex-col gap-2 text-green-100 sm:flex-row sm:items-center">
                  <span className="flex items-center"><Leaf size={16} className="mr-2" /> Farmer: {latestData.user_name}</span>
                  <span className="hidden sm:inline">|</span>
                  <span className="flex items-center"><Sprout size={16} className="mr-2" /> Farm ID: {latestData.farm}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className={`flex items-center rounded-full px-4 py-2 ${getHealthColor(latestData.overall_health)} text-white font-medium`}>
                  <ArrowUpCircle size={20} className="mr-2" />
                  <span>Overall Health: {latestData.overall_health}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Vegetation Health"
            value={latestData.ndvi}
            status={latestData.ndvi_status}
            parameter="ndvi"
            statusText={latestData.ndvi_status}
            changeValue={latestData.ndvi_change}
          />
          <StatCard
            title="Leaf Health"
            value={latestData.ndre}
            status={latestData.ndre_status}
            parameter="ndre"
            statusText={latestData.ndre_status}
            changeValue={latestData.ndre_change}
          />
          <StatCard
            title="Moisture Content"
            value={latestData.ndmi}
            status={latestData.ndmi_status}
            parameter="ndmi"
            statusText={latestData.ndmi_status}
            changeValue={latestData.ndmi_change}
          />
          <StatCard
            title="Water Level"
            value={latestData.ndwi}
            status={latestData.ndwi_status}
            parameter="ndwi"
            statusText={latestData.ndwi_status}
            changeValue={latestData.ndwi_change}
          />
          <StatCard
            title="Carbon Index (CI)"
            value={latestData.ci}
            status={latestData.ci_status}
            parameter="ci"
            statusText={latestData.ci_status}
            changeValue={latestData.ci_change}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
              <Sprout size={20} className="mr-2 text-green-700" />
              Weekly {activeParameter.toUpperCase()} Trend
            </h2>
            <div className="h-80">
              {trendData && (
                <Line
                  data={trendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { position: 'top' },
                      tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#2c7744',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 4,
                      }
                    },
                    scales: {
                      y: { 
                        min: -1, 
                        max: 1,
                        grid: { 
                          color: 'rgba(0,0,0,0.05)',
                        },
                        ticks: {
                          font: { weight: 500 }
                        }
                      },
                      x: {
                        grid: { display: false },
                        ticks: {
                          font: { weight: 500 }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="p-6 bg-white shadow-lg rounded-xl">
            <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
              <Sun size={20} className="mr-2 text-green-700" />
              Current Parameter Overview
            </h2>
            <div className="h-80">
              {radarData && (
                <Radar
                  data={radarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#2c7744',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 4,
                      }
                    },
                    scales: { 
                      r: { 
                        min: -100, 
                        max: 100,
                        ticks: { 
                          backdropColor: 'rgba(255, 255, 255, 0.8)',
                          font: { weight: 500 } 
                        },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                      } 
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CropPerformanceDashboard;