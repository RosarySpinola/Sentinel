use crate::error::ApiError;
use crate::simulation::{ChangeType, SimEvent, SimulationResult, StateChange};

/// Parse a simulation API response into a SimulationResult
pub fn parse_simulation_result(result: &serde_json::Value) -> Result<SimulationResult, ApiError> {
    let success = result.get("success")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let gas_used = result.get("gas_used")
        .and_then(|v| v.as_str())
        .and_then(|s| s.parse().ok())
        .unwrap_or(0);

    let gas_unit_price = result.get("gas_unit_price")
        .and_then(|v| v.as_str())
        .and_then(|s| s.parse().ok())
        .unwrap_or(100);

    let vm_status = result.get("vm_status")
        .and_then(|v| v.as_str())
        .unwrap_or("Unknown")
        .to_string();

    Ok(SimulationResult {
        success,
        gas_used,
        gas_unit_price,
        vm_status,
        state_changes: parse_state_changes(result),
        events: parse_events(result),
        error: None,
    })
}

/// Parse state changes from simulation response
pub fn parse_state_changes(result: &serde_json::Value) -> Vec<StateChange> {
    let changes = result.get("changes")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();

    changes.iter().filter_map(|change| {
        let change_type = change.get("type")?.as_str()?;
        let address = change.get("address")?.as_str()?.to_string();

        match change_type {
            "write_resource" => {
                let resource = change.get("data")
                    .and_then(|d| d.get("type"))
                    .and_then(|t| t.as_str())
                    .unwrap_or("unknown")
                    .to_string();
                let data = change.get("data")
                    .and_then(|d| d.get("data"))
                    .cloned();

                Some(StateChange {
                    address,
                    resource,
                    change_type: ChangeType::Write,
                    before: None,
                    after: data,
                })
            }
            "delete_resource" => {
                let resource = change.get("resource")?.as_str()?.to_string();
                Some(StateChange {
                    address,
                    resource,
                    change_type: ChangeType::Delete,
                    before: None,
                    after: None,
                })
            }
            _ => None,
        }
    }).collect()
}

/// Parse events from simulation response
pub fn parse_events(result: &serde_json::Value) -> Vec<SimEvent> {
    let events = result.get("events")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();

    events.iter().filter_map(|event| {
        let event_type = event.get("type")?.as_str()?.to_string();
        let data = event.get("data")?.clone();
        let sequence_number = event.get("sequence_number")
            .and_then(|v| v.as_str())
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);

        Some(SimEvent {
            r#type: event_type,
            data,
            sequence_number,
        })
    }).collect()
}
