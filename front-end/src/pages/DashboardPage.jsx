import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { LuDollarSign, LuBook, LuUsers, LuCar, LuActivity } from 'react-icons/lu';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, // <-- Import for Doughnut charts
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { fetchAdminDashboardStats } from '../services/api';

// Register all the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- A more stylish Stat Card Component ---
const StatCard = ({ title, value, icon, colorClass }) => (
  <Card className={`shadow-sm border-0 rounded-4 h-100  p-1 px-3 card-hover-effect bg-${colorClass}`}>
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center ">
        <div className="flex-grow-1">
          <p className={`text-white mb-1 text-uppercase fw-bold small`}>{title}</p>
          <h1 className="mb-0 text-white fs-2  fw-bolder">{value}</h1>
        </div>
        <div className={`flex-shrink-0 ms-3 p-3 rounded-3 bg-white`}>
           {React.cloneElement(icon, { className: `text-${colorClass}` })}
        </div>
      </div>
    </Card.Body>
  </Card>
);

// --- Main Dashboard Page Component ---
const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardStats = async () => {
      setLoading(true); setError('');
      try {
        const response = await fetchAdminDashboardStats();
        setStats(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error("Dashboard fetch error:", err);
      } finally { setLoading(false); }
    };
    loadDashboardStats();
  }, []);

  // --- Reusable Chart Helper Function ---
  const prepareDoughnutData = (title, dataObject, colorSet) => {
    const labels = Object.keys(dataObject);
    const data = Object.values(dataObject);

    return {
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          backgroundColor: colorSet,
          borderColor: '#ffffff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 15 } },
          title: { display: true, text: title, font: { size: 16 } },
        },
        cutout: '60%',
      }
    };
  };

  // --- Render States ---
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <h4 className="ms-3">Loading Dashboard...</h4>
      </div>
    );
  }

  if (error) { return <Alert variant="danger" className="m-4">{error}</Alert>; }
  if (!stats) { return <Alert variant="warning" className="m-4">No dashboard data available.</Alert>; }

  // --- Prepare Chart Data using the helper ---
  const bookingChart = prepareDoughnutData(
    'Booking Statuses',
    stats.booking_status_counts,
    ['#0d6efd', '#198754', '#ffc107', '#6c757d', '#dc3545'] // Blue, Green, Yellow, Gray, Red
  );

  const vehicleChart = prepareDoughnutData(
    'Vehicle Statuses',
    stats.vehicle_status_counts,
    ['#20c997', '#fd7e14', '#6f42c1', '#adb5bd', '#dc3545'] // Teal, Orange, Purple, Gray, Red
  );

  const revenueChartData = {
    labels: stats.revenue_over_time.map(d => d.date),
    datasets: [{
      label: 'Revenue (MAD)',
      data: stats.revenue_over_time.map(d => d.revenue),
      backgroundColor: 'rgba(2, 117, 216, 0.7)',
      borderColor: 'rgba(2, 117, 216, 1)',
      borderWidth: 1,
      borderRadius: 5,
    }],
  };
  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Revenue Over Last 30 Days', font: { size: 18 } },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="p-4" >
      <style type="text/css">
        {`
          .card-hover-effect { transition: all 0.3s ease-in-out; }
          .card-hover-effect:hover { transform: translateY(-5px); box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important; }
        `}
      </style>
      <Container fluid className=''>
        

        {/* KPI Cards */}
        <Row className="g-4 mb-4">
          <Col md={6} xl={3}>
            <StatCard title="Total Revenue" value={`${stats.kpis.total_revenue.toFixed(2)} MAD`} icon={<LuDollarSign size={28} />} colorClass="success" />
          </Col>
          <Col md={6} xl={3}>
            <StatCard title="Total Bookings" value={stats.kpis.total_bookings} icon={<LuBook size={28} />} colorClass="primary" />
          </Col>
          <Col md={6} xl={3}>
            <StatCard title="Total Users" value={stats.kpis.total_users} icon={<LuUsers size={28} />} colorClass="info" />
          </Col>
          <Col md={6} xl={3}>
            <StatCard title="Vehicles in Fleet" value={stats.kpis.total_vehicles} icon={<LuCar size={28} />} colorClass="warning" />
          </Col>
        </Row>

        <Row className="g-4">
          {/* Revenue Chart - Given more prominence */}
          <Col lg={7}>
            <Card className="shadow-sm border-0 h-100 card-hover-effect">
              <Card.Body className="d-flex flex-column">
                <div style={{ height: '450px' }}>
                  <Bar options={revenueChartOptions} data={revenueChartData} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Doughnut Charts */}
          <Col lg={5}>
            <Row className="g-4">
              <Col xs={12}>
                <Card className="shadow-sm border-0 card-hover-effect">
                  <Card.Body>
                    <div style={{ height: '205px' }}>
                      <Doughnut data={bookingChart.data} options={bookingChart.options} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12}>
                <Card className="shadow-sm border-0 card-hover-effect">
                  <Card.Body>
                    <div style={{ height: '205px' }}>
                      <Doughnut data={vehicleChart.data} options={vehicleChart.options} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
        
         {/* Recent Activity Table */}
        <Row className="mt-4">
            <Col>
                <Card className="shadow-sm border-0 card-hover-effect">
                    <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0"><LuActivity className="me-2" />Recent Bookings</h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="table-light">
                        <tr>
                            <th className="ps-4 py-3">Renter</th>
                            <th className="py-3">Vehicle</th>
                            <th className="py-3">Status</th>
                            <th className="text-end pe-4 py-3">Price</th>
                        </tr>
                        </thead>
                        <tbody>
                        {stats.recent_bookings.map(booking => (
                            <tr key={booking.id} style={{ verticalAlign: 'middle' }}>
                            <td className="ps-4">{booking.renter_name || 'N/A'}</td>
                            <td>{booking.vehicle_name || 'N/A'}</td>
                            <td><Badge pill bg="light" text="dark" className="fw-normal">{booking.status || 'N/A'}</Badge></td>
                            <td className="text-end pe-4 fw-bold">{booking.final_price.toFixed(2)} MAD</td>
                            </tr>
                        ))}
                        {stats.recent_bookings.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center text-muted p-5">No recent bookings to display.</td>
                            </tr>
                            )}
                        </tbody>
                    </Table>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardPage;