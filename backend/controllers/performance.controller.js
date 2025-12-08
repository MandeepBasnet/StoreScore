const storeScoreAPI = require('../services/storeScoreAPI');

/**
 * Get performance overview/dashboard data
 */
const getPerformanceOverview = async (req, res) => {
  try {
    const { storeId, period } = req.query;
    
    const params = {};
    if (storeId) params.storeId = storeId;
    if (period) params.period = period;

    const result = await storeScoreAPI.get('/performance/overview', params);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get performance overview error:', error);
    res.status(error.status || 500).json({
      error: {
        message: error.message || 'Failed to retrieve performance overview',
        status: error.status || 500
      }
    });
  }
};

/**
 * Get performance trends
 */
const getPerformanceTrends = async (req, res) => {
  try {
    const { storeId, metric, startDate, endDate } = req.query;
    
    const params = {};
    if (storeId) params.storeId = storeId;
    if (metric) params.metric = metric;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const result = await storeScoreAPI.get('/performance/trends', params);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get performance trends error:', error);
    res.status(error.status || 500).json({
      error: {
        message: error.message || 'Failed to retrieve performance trends',
        status: error.status || 500
      }
    });
  }
};

/**
 * Get store comparison data
 */
const getStoreComparison = async (req, res) => {
  try {
    const { storeIds, metric, period } = req.query;
    
    const params = {};
    if (storeIds) params.storeIds = storeIds;
    if (metric) params.metric = metric;
    if (period) params.period = period;

    const result = await storeScoreAPI.get('/performance/comparison', params);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get store comparison error:', error);
    res.status(error.status || 500).json({
      error: {
        message: error.message || 'Failed to retrieve store comparison',
        status: error.status || 500
      }
    });
  }
};

module.exports = {
  getPerformanceOverview,
  getPerformanceTrends,
  getStoreComparison
};
