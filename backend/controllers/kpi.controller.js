const storeScoreAPI = require('../services/storeScoreAPI');

/**
 * Submit KPI data
 */
const submitKPI = async (req, res) => {
  try {
    const kpiData = req.body;
    
    // TODO: Validate KPI data structure
    if (!kpiData) {
      return res.status(400).json({
        error: {
          message: 'KPI data is required',
          status: 400
        }
      });
    }

    // Send to StoreScore API
    const result = await storeScoreAPI.post('/kpi', kpiData);
    
    res.status(201).json({
      success: true,
      message: 'KPI data submitted successfully',
      data: result
    });
  } catch (error) {
    console.error('Submit KPI error:', error);
    res.status(error.status || 500).json({
      error: {
        message: error.message || 'Failed to submit KPI data',
        status: error.status || 500
      }
    });
  }
};

/**
 * Get all KPI entries
 */
const getKPIs = async (req, res) => {
  try {
    const { startDate, endDate, storeId } = req.query;
    
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (storeId) params.storeId = storeId;

    const result = await storeScoreAPI.get('/kpi', params);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get KPIs error:', error);
    res.status(error.status || 500).json({
      error: {
        message: error.message || 'Failed to retrieve KPI data',
        status: error.status || 500
      }
    });
  }
};

/**
 * Get specific KPI entry by ID
 */
const getKPIById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await storeScoreAPI.get(`/kpi/${id}`);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get KPI by ID error:', error);
    res.status(error.status || 500).json({
      error: {
        message: error.message || 'Failed to retrieve KPI entry',
        status: error.status || 500
      }
    });
  }
};

/**
 * Update KPI entry
 */
const updateKPI = async (req, res) => {
  try {
    const { id } = req.params;
    const kpiData = req.body;
    
    const result = await storeScoreAPI.put(`/kpi/${id}`, kpiData);
    
    res.json({
      success: true,
      message: 'KPI entry updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update KPI error:', error);
    res.status(error.status || 500).json({
      error: {
        message: error.message || 'Failed to update KPI entry',
        status: error.status || 500
      }
    });
  }
};

/**
 * Delete KPI entry
 */
const deleteKPI = async (req, res) => {
  try {
    const { id } = req.params;
    
    await storeScoreAPI.delete(`/kpi/${id}`);
    
    res.json({
      success: true,
      message: 'KPI entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete KPI error:', error);
    res.status(error.status || 500).json({
      error: {
        message: error.message || 'Failed to delete KPI entry',
        status: error.status || 500
      }
    });
  }
};

module.exports = {
  submitKPI,
  getKPIs,
  getKPIById,
  updateKPI,
  deleteKPI
};
