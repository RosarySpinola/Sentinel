use crate::simulation::SimulationResult;
use super::types::{GasStep, OperationGas};

/// Create a gas step timeline for visualization
pub fn create_timeline(
    sim_result: &SimulationResult,
    operations: &[OperationGas],
) -> Vec<GasStep> {
    let mut steps = Vec::new();
    let mut cumulative: u64 = 0;
    let mut step_num: u32 = 1;

    // Function entry
    steps.push(GasStep {
        step: step_num,
        gas: 100,
        cumulative: {
            cumulative += 100;
            cumulative
        },
        operation: "Function Entry".to_string(),
    });
    step_num += 1;

    // Add steps for each operation category
    for op in operations {
        if op.total_gas > 0 {
            steps.push(GasStep {
                step: step_num,
                gas: op.total_gas,
                cumulative: {
                    cumulative += op.total_gas;
                    cumulative
                },
                operation: op.operation.clone(),
            });
            step_num += 1;
        }
    }

    // If we have more detailed info from state changes, add those
    for change in sim_result.state_changes.iter().take(5) {
        steps.push(GasStep {
            step: step_num,
            gas: 100,
            cumulative: {
                cumulative += 100;
                cumulative
            },
            operation: format!(
                "Write: {}",
                change.resource.split("::").last().unwrap_or(&change.resource)
            ),
        });
        step_num += 1;
    }

    // Function return
    steps.push(GasStep {
        step: step_num,
        gas: 10,
        cumulative: {
            cumulative += 10;
            cumulative
        },
        operation: "Function Return".to_string(),
    });

    // Normalize cumulative to match total gas
    normalize_timeline(&mut steps, sim_result.gas_used, cumulative);

    steps
}

/// Normalize timeline steps to match actual total gas used
fn normalize_timeline(steps: &mut [GasStep], total: u64, cumulative: u64) {
    if cumulative > 0 && total > 0 {
        let ratio = total as f64 / cumulative as f64;
        for step in steps.iter_mut() {
            step.gas = (step.gas as f64 * ratio) as u64;
            step.cumulative = (step.cumulative as f64 * ratio) as u64;
        }
    }
}
