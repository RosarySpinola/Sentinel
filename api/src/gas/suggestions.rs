use super::types::{GasSuggestion, OperationGas};

/// Generate optimization suggestions based on gas analysis
pub fn generate_suggestions(
    total_gas: u64,
    operations: &[OperationGas],
) -> Vec<GasSuggestion> {
    let mut suggestions = Vec::new();

    // Pattern: High storage operations
    let storage_gas: u64 = operations
        .iter()
        .filter(|op| op.operation.contains("Storage"))
        .map(|op| op.total_gas)
        .sum();

    if storage_gas > total_gas * 50 / 100 {
        suggestions.push(GasSuggestion {
            severity: "warning".to_string(),
            message: "Storage operations consume over 50% of gas. Consider batching writes or using more efficient data structures.".to_string(),
            location: None,
            estimated_savings: storage_gas * 20 / 100,
        });
    }

    // Pattern: Many events
    let event_ops = operations
        .iter()
        .find(|op| op.operation.contains("Event"));

    if let Some(event_op) = event_ops {
        if event_op.count > 5 {
            suggestions.push(GasSuggestion {
                severity: "info".to_string(),
                message: "Multiple events emitted. Consider consolidating events if consumers don't need granular updates.".to_string(),
                location: None,
                estimated_savings: (event_op.count as u64 - 5) * 100,
            });
        }
    }

    // Pattern: High total gas
    if total_gas > 50_000 {
        suggestions.push(GasSuggestion {
            severity: "info".to_string(),
            message: "Transaction uses significant gas. Review if all operations are necessary.".to_string(),
            location: None,
            estimated_savings: 0,
        });
    }

    // Pattern: Low gas transaction - optimization not critical
    if total_gas < 1_000 && suggestions.is_empty() {
        suggestions.push(GasSuggestion {
            severity: "info".to_string(),
            message: "Transaction is already gas-efficient. No significant optimizations available.".to_string(),
            location: None,
            estimated_savings: 0,
        });
    }

    suggestions
}
