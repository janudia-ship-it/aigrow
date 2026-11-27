import type { ActuatorRule, RuleCondition, RuleConditionInput, Sensor } from "../types/device";
import { getSensorReadings } from "../services/device-service";

export async function evaluateRuleCondition(
    condition: RuleCondition | RuleConditionInput,
    deviceSensors?: Sensor[]
): Promise<boolean> {
    let currentVal: number | null = null;

    // Check deviceSensors first (local device sensors with live value)
    const matched = deviceSensors?.find((s) => s.id === Number(condition.sensorId));
    if (matched && typeof matched.value === "number") {
        currentVal = matched.value;
    } else {
        try {
            const now = new Date();
            const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const readings = await getSensorReadings(
                Number(condition.sensorId),
                past.toISOString(),
                now.toISOString()
            );
            const points = readings?.points || [];
            if (points.length > 0) {
                const latest = points[points.length - 1];
                currentVal = latest.avg ?? latest.max ?? latest.min ?? null;
            }
        } catch {
            currentVal = null;
        }
    }

    if (currentVal === null || isNaN(currentVal)) {
        return false;
    }

    const thresh = Number(condition.threshold);
    switch (condition.operator) {
        case ">":
            return currentVal > thresh;
        case ">=":
            return currentVal >= thresh;
        case "<":
            return currentVal < thresh;
        case "<=":
            return currentVal <= thresh;
        case "==":
        case "=":
            return currentVal === thresh;
        case "!=":
            return currentVal !== thresh;
        default:
            return false;
    }
}

export async function evaluateRuleConditions(
    conditions: (RuleCondition | RuleConditionInput)[],
    matchType: "All" | "Any" | string,
    deviceSensors?: Sensor[]
): Promise<boolean> {
    if (!conditions || conditions.length === 0) return false;

    const results = await Promise.all(
        conditions.map((c) => evaluateRuleCondition(c, deviceSensors))
    );

    if (matchType?.toLowerCase() === "any") {
        return results.some(Boolean);
    }
    // Default to "All"
    return results.every(Boolean);
}

export async function evaluateEnabledActuatorRules(
    rules: ActuatorRule[],
    deviceSensors?: Sensor[]
): Promise<boolean | null> {
    const enabledRules = (rules || []).filter((r) => r.isEnabled);
    if (enabledRules.length === 0) return null;

    for (const rule of enabledRules) {
        const isMet = await evaluateRuleConditions(rule.conditions, rule.matchType, deviceSensors);
        if (isMet) {
            return rule.targetState;
        }
    }

    return null;
}
