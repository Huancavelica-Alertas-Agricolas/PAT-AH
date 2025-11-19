class Alert {
  constructor() {
    this.alert_id = undefined;
    this.alert_type = undefined;
    this.description = undefined;
    this.severity_level = undefined;
    this.issued_at = undefined;
    this.effective_at = undefined;
    this.expires_at = undefined;
    this.affected_region = undefined;
    this.user_alerts = undefined;
  }
}

module.exports = { Alert };
