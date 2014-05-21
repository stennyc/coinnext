(function() {
  var JsonRenderer, MarketStats, Order, OrderLog, TradeStats;

  MarketStats = GLOBAL.db.MarketStats;

  TradeStats = GLOBAL.db.TradeStats;

  OrderLog = GLOBAL.db.OrderLog;

  Order = GLOBAL.db.Order;

  JsonRenderer = require("./../lib/json_renderer");

  module.exports = function(app) {
    app.get("/v1/market/summary", function(req, res, next) {
      return MarketStats.findEnabledMarkets(null, null, function(err, marketStats) {
        return res.send(JsonRenderer.marketSummary(marketStats));
      });
    });
    app.get("/v1/market/summary/:exchange", function(req, res, next) {
      return MarketStats.findEnabledMarkets(null, req.params.exchange).complete(function(err, marketStats) {
        return res.send(JsonRenderer.marketSummary(marketStats));
      });
    });
    app.get("/v1/market/stats/:coin/:exchange", function(req, res, next) {
      return MarketStats.findEnabledMarkets(req.params.coin, req.params.exchange).complete(function(err, marketStats) {
        return res.send(JsonRenderer.marketSummary(marketStats));
      });
    });
    app.get("/v1/market/trades/:coin/:exchange", function(req, res, next) {
      var options;
      options = {};
      options.currency1 = req.params.coin;
      options.currency2 = req.params.exchange;
      options.limit = 100;
      return OrderLog.findActiveByOptions(options, function(err, orderLogs) {
        return res.send(JsonRenderer.lastTrades(orderLogs));
      });
    });
    app.get("/v1/market/orders/:coin/:exchange/:type", function(req, res, next) {
      var options;
      options = {};
      options.status = "open";
      options.action = req.params.type.toLowerCase();
      options.currency1 = req.params.coin;
      options.currency2 = req.params.exchange;
      options.published = true;
      options.limit = 50;
      if (options.action === "buy") {
        options.sort_by = [["unit_price", "DESC"], ["created_at", "ASC"]];
      } else if (options.action === "sell") {
        options.sort_by = [["unit_price", "ASC"], ["created_at", "ASC"]];
      }
      return Order.findByOptions(options, function(err, orders) {
        return res.send(JsonRenderer.lastOrders(options.action, orders));
      });
    });
    return app.get("/v1/market/chartdata/:market_id/:period?", function(req, res, next) {
      var options;
      options = {};
      options.marketId = req.params.market_id;
      if (req.params.period != null) {
        options.period = req.params.period;
      }
      return TradeStats.findByOptions(options, function(err, tradeStats) {
        return res.send(JsonRenderer.chartData(tradeStats));
      });
    });
  };

}).call(this);
