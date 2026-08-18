const agentService = require('../services/agentService');

/**
 * GET /api/v1/agents
 */
async function list(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const { status, model, search, sort, sortBy, order, sortOrder, page, limit } = req.query;

    const result = await agentService.listAgents(userId, {
      status,
      model,
      search,
      sort: sort || sortBy,
      order: order || sortOrder,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      message: "Daftar konfigurasi agen berhasil diambil",
      data: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/agents/:id
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'user';

    const result = await agentService.getAgentById(id, userId, userRole);

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail konfigurasi agen berhasil diambil",
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/agents
 */
async function create(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const {
      name,
      description,
      model,
      system_prompt,
      temperature,
      max_tokens,
      learning_rate,
      discount_factor,
      exploration_rate
    } = req.body;

    const result = await agentService.createAgent(userId, {
      name,
      description,
      model,
      system_prompt,
      temperature,
      max_tokens,
      learning_rate,
      discount_factor,
      exploration_rate
    });

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT or PATCH /api/v1/agents/:id
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'user';

    const result = await agentService.updateAgent(id, userId, req.body, userRole);

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/agents/:id
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'user';

    const result = await agentService.deleteAgent(id, userId, userRole);

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/agents/:id/execute
 */
async function execute(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'user';
    const { prompt, parameters, iterations, session_id } = req.body;

    const result = await agentService.executeAgent(id, userId, {
      prompt,
      parameters,
      iterations,
      session_id
    }, userRole);

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/agents/:id/status
 */
async function getStatus(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'user';

    const result = await agentService.getAgentStatus(id, userId, userRole);

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/agents/:id/logs
 */
async function getLogs(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'user';
    const { execution_id, iteration, level, page, limit } = req.query;

    const result = await agentService.getAgentLogs(id, userId, {
      execution_id,
      iteration,
      level,
      page,
      limit
    }, userRole);

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/agents/:id/metrics
 */
async function getMetrics(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'user';

    const result = await agentService.getAgentMetrics(id, userId, userRole);

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  execute,
  getStatus,
  getLogs,
  getMetrics
};
