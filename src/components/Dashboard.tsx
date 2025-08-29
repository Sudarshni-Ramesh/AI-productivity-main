import React, { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale } from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import { getGraphsData, executeQuery } from '../postgres-proxy/utils'
import useAppStore from './state-utils/state-management'
import { GiUnicorn } from 'react-icons/gi'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale)

interface ChartData {
  labels: any[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor: string[];
    hoverBackgroundColor?: string[];
  }[];
}

interface ChartInfo {
  id: number;
  type: 'pie' | 'bar' | 'line' | 'doughnut' | 'radar' | 'polarArea';
  data: ChartData;
  title: string;
}

const GenericChart: React.FC<ChartInfo> = ({ type, data, title }) => {
  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-md w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="h-[400px]">
        <Chart 
          type={type} 
          data={data} 
          options={{ 
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: title,
              },
            },
          }} 
        />
      </div>
    </motion.div>
  )
}


const Dashboard: React.FC = () => {
  const [chartList, setChartList] = useState<ChartInfo[]>([]);
  const { dataVersion } = useAppStore();


  const fetchChartData = async () => {
    console.log("fetching chart data");
    const graphsData = await getGraphsData();
    console.log("graphsData", graphsData);
    const charts = await Promise.all(graphsData.map(async (graph: any) => {
      console.log("executing query", graph.data_query);
      const rawData = await executeQuery(graph.data_query);
      console.log("rawData", rawData);
      const values = rawData[0].rows.map((row: any) => parseFloat(row.value) || 0);
      const keys = rawData[0].rows.map((row: any) => {
        // Remove any surrounding quotes and backslashes
        let cleanKey = row.key.replace(/^["']+|["']+$/g, '').replace(/\\/g, '');
        
        // Regex to match the specific date format
        const dateRegex = /^(\d{4}-\d{2}-\d{2})T00:00:00\.000Z$/;
        const match = cleanKey.match(dateRegex);
        
        if (match) {
          // If it matches, return just the date part
          return match[1];
        }
        
        // If it doesn't match, return the cleaned key
        return cleanKey;
      });

      console.log("values", values);
      console.log("keys", keys);
      console.log("graph.labels", graph.labels, typeof graph.labels);

      // Convert graph.labels to array if it's a string
      const labels = typeof graph.labels === 'string' ? graph.labels.split(',') : graph.labels;

      const backgroundColors = JSON.parse(graph.background_colors.replace(/'/g, '"'));
      const hoverBackgroundColors = JSON.parse(graph.hover_background_colors.replace(/'/g, '"'));

      const chartData = {
        labels: keys,
        datasets: [{
          label: graph.dataset_label || undefined,
          data: values,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: hoverBackgroundColors || undefined,
        }]
      };

      console.log("chartData", chartData);

      return {
        id: graph.id,
        type: graph.type,
        title: graph.title,
        data: chartData
      };
    }));
    setChartList(charts);
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [dataVersion]);


  return (
    <div className="max-w-7xl mx-auto p-2">
      {chartList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {chartList.map((chart) => (
            <div key={chart.id} className="h-[500px]">
              <GenericChart {...chart} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="mb-8"
          >
            <GiUnicorn size={100} color="#696969" />
          </motion.div>
          <p className="text-xl text-gray-600 text-center">
            Oops 404! No graphs to show yet.<br />
            Why not ask AI to create one for you?
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
