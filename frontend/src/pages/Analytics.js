import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../services/api';
import { FaArrowLeft } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [occupancyData, setOccupancyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const response = await api.get('/analytics/occupancy', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      });

      const data = response.data.data || [];
      
      const chartData = {
        labels: data.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
          label: 'Occupancy %',
          data: data.map(d => d.occupancy_percentage),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }]
      };

      setOccupancyData(chartData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
          <FaArrowLeft /> Back
        </button>
        <h1>Analytics Dashboard</h1>
      </div>

      <div className="card">
        <h3>Bus Occupancy - Last 7 Days</h3>
        {occupancyData ? (
          <Bar
            data={occupancyData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Average Bus Occupancy Percentage' }
              },
              scales: { y: { beginAtZero: true, max: 100 } }
            }}
          />
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
