"use client";

import { useState, useEffect, useCallback } from "react";
import {
    X,
    Sliders,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertCircle,
    Check,
    ArrowLeft,
    Power,
    CheckCircle2,
    XCircle,
    Info,
    MoreVertical,
} from "lucide-react";
import type {
    Actuator,
    ActuatorRule,
    RuleSensor,
    RuleConditionInput,
} from "../types/device";
import {
    getActuatorRules,
    getRuleSensors,
    createActuatorRule,
    updateActuatorRule,
    deleteActuatorRule,
} from "../services/device-service";

interface ActuatorRulesModalProps {
    actuator: Actuator | null;
    isOpen: boolean;
    canManage: boolean;
    onClose: () => void;
    onRulesChanged?: () => void;
}

const OPERATORS = [
    { value: ">=", label: "≥ (Greater than or equal to)" },
    { value: ">", label: "> (Greater than)" },
    { value: "<=", label: "≤ (Less than or equal to)" },
    { value: "<", label: "< (Less than)" },
];

export default function ActuatorRulesModal({
    actuator,
    isOpen,
    canManage,
    onClose,
    onRulesChanged,
}: ActuatorRulesModalProps) {
    const [rules, setRules] = useState<ActuatorRule[]>([]);
    const [sensors, setSensors] = useState<RuleSensor[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // View state: 'list' | 'create' | 'edit'
    const [view, setView] = useState<"list" | "create" | "edit">("list");
    const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
    const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);
    const [activeMenuRuleId, setActiveMenuRuleId] = useState<number | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        if (activeMenuRuleId === null) return;
        const handleClickOutside = () => setActiveMenuRuleId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [activeMenuRuleId]);

    // Form fields
    const [formName, setFormName] = useState("");
    const [formMatchType, setFormMatchType] = useState<"All" | "Any">("All");
    const [formTargetState, setFormTargetState] = useState<boolean>(true);
    const [formIsEnabled, setFormIsEnabled] = useState<boolean>(true);
    const [formConditions, setFormConditions] = useState<RuleConditionInput[]>([
        { sensorId: 0, operator: ">=", threshold: 0 },
    ]);

    const loadData = useCallback(async () => {
        if (!actuator) return;
        setLoading(true);
        setError(null);
        try {
            const [rulesData, sensorsData] = await Promise.all([
                getActuatorRules(actuator.id),
                getRuleSensors(actuator.id),
            ]);
            setRules(rulesData);
            setSensors(sensorsData);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load rules");
        } finally {
            setLoading(false);
        }
    }, [actuator]);

    useEffect(() => {
        if (isOpen && actuator) {
            setView("list");
            setEditingRuleId(null);
            setDeletingRuleId(null);
            loadData();
        }
    }, [isOpen, actuator, loadData]);

    if (!isOpen || !actuator) return null;

    const handleOpenCreate = () => {
        const defaultSensorId = sensors.length > 0 ? sensors[0].id : 0;
        setFormName("");
        setFormMatchType("All");
        setFormTargetState(true);
        setFormIsEnabled(true);
        setFormConditions([
            { sensorId: defaultSensorId, operator: ">=", threshold: 0 },
        ]);
        setFormError(null);
        setView("create");
    };

    const handleOpenEdit = (rule: ActuatorRule) => {
        setEditingRuleId(rule.id);
        setFormName(rule.name);
        setFormMatchType(rule.matchType?.toLowerCase() === "any" ? "Any" : "All");
        setFormTargetState(rule.targetState);
        setFormIsEnabled(rule.isEnabled);
        setFormConditions(
            rule.conditions.map((c) => ({
                sensorId: c.sensorId,
                operator: c.operator,
                threshold: c.threshold,
            }))
        );
        setFormError(null);
        setView("edit");
    };

    const handleAddCondition = () => {
        if (formConditions.length >= 5) return;
        const defaultSensorId = sensors.length > 0 ? sensors[0].id : 0;
        setFormConditions((prev) => [
            ...prev,
            { sensorId: defaultSensorId, operator: ">=", threshold: 0 },
        ]);
    };

    const handleRemoveCondition = (index: number) => {
        if (formConditions.length <= 1) return;
        setFormConditions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleConditionChange = (
        index: number,
        field: keyof RuleConditionInput,
        val: any
    ) => {
        setFormConditions((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: val };
            return next;
        });
    };

    const handleSaveRule = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const trimmedName = formName.trim();
        if (!trimmedName) {
            setFormError("Rule name is required.");
            return;
        }
        if (trimmedName.length > 64) {
            setFormError("Rule name cannot exceed 64 characters.");
            return;
        }

        if (formConditions.length === 0 || formConditions.length > 5) {
            setFormError("Rules must contain between 1 and 5 conditions.");
            return;
        }

        for (let i = 0; i < formConditions.length; i++) {
            const c = formConditions[i];
            if (!c.sensorId || c.sensorId <= 0) {
                setFormError(`Condition #${i + 1} has an invalid sensor selected.`);
                return;
            }
            if (isNaN(Number(c.threshold))) {
                setFormError(`Condition #${i + 1} must have a valid numeric threshold.`);
                return;
            }
            if (c.threshold < -9999999.999 || c.threshold > 9999999.999) {
                setFormError(`Condition #${i + 1} threshold must be between -9,999,999.999 and 9,999,999.999.`);
                return;
            }
        }

        // Check for duplicate conditions
        const seen = new Set<string>();
        for (const c of formConditions) {
            const key = `${c.sensorId}_${c.operator}_${c.threshold}`;
            if (seen.has(key)) {
                setFormError("A rule cannot contain duplicate conditions.");
                return;
            }
            seen.add(key);
        }

        setActionLoading(true);
        try {
            const payload = {
                name: trimmedName,
                matchType: formMatchType,
                targetState: formTargetState,
                isEnabled: formIsEnabled,
                conditions: formConditions.map((c) => ({
                    sensorId: Number(c.sensorId),
                    operator: c.operator,
                    threshold: Number(c.threshold),
                })),
            };

            if (view === "create") {
                await createActuatorRule(actuator.id, payload);
            } else if (view === "edit" && editingRuleId) {
                await updateActuatorRule(actuator.id, editingRuleId, payload);
            }

            await loadData();
            setView("list");
            onRulesChanged?.();
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : "Failed to save rule");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (ruleId: number) => {
        setActionLoading(true);
        setError(null);
        try {
            await deleteActuatorRule(actuator.id, ruleId);
            setDeletingRuleId(null);
            await loadData();
            onRulesChanged?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to delete rule");
        } finally {
            setActionLoading(false);
        }
    };

    const handleQuickToggleEnabled = async (rule: ActuatorRule) => {
        if (!canManage) return;
        setActionLoading(true);
        try {
            await updateActuatorRule(actuator.id, rule.id, {
                name: rule.name,
                matchType: rule.matchType,
                targetState: rule.targetState,
                isEnabled: !rule.isEnabled,
                conditions: rule.conditions.map((c) => ({
                    sensorId: c.sensorId,
                    operator: c.operator,
                    threshold: c.threshold,
                })),
            });
            await loadData();
            onRulesChanged?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to toggle rule");
        } finally {
            setActionLoading(false);
        }
    };

    const getSensorLabel = (sensorId: number) => {
        const found = sensors.find((s) => s.id === sensorId);
        if (!found) return `Sensor #${sensorId}`;
        const unitStr = found.unit ? ` (${found.unit})` : "";
        const sharedStr = !found.isOwnDevice ? ` • ${found.deviceName}` : "";
        return `${found.name}${unitStr}${sharedStr}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div
                className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F2EF] dark:bg-[#142623] text-[#004C4B] dark:text-[#00E5A3]">
                            <Sliders size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <span>{actuator.name} Auto Rules</span>
                                {view !== "list" && (
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#004C4B]/10 text-[#004C4B] dark:bg-[#00E5A3]/10 dark:text-[#00E5A3] font-normal">
                                        {view === "create" ? "Create Rule" : "Edit Rule"}
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Applied when control mode is set to <strong>Auto</strong>
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {/* General Error Banner */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* View: Rule List */}
                    {view === "list" && (
                        <div className="space-y-4">
                            {/* Action Bar */}
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {rules.length} / 10 rules defined
                                </div>

                                {canManage && (
                                    <button
                                        type="button"
                                        onClick={handleOpenCreate}
                                        disabled={rules.length >= 10 || loading}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <Plus size={14} />
                                        <span>Create Rule</span>
                                    </button>
                                )}
                            </div>

                            {/* Loading State */}
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
                                    <Loader2 size={24} className="animate-spin text-[#004C4B] dark:text-[#00E5A3]" />
                                    <span className="text-xs">Loading actuator rules…</span>
                                </div>
                            ) : rules.length === 0 ? (
                                /* Empty State */
                                <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-2.5">
                                    <Sliders size={32} className="text-gray-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            No Auto Rules Configured
                                        </p>
                                        <p className="text-xs text-gray-400 max-w-sm mt-0.5">
                                            Auto rules automatically turn this actuator ON or OFF based on sensor conditions when in Auto mode.
                                        </p>
                                    </div>
                                    {canManage && (
                                        <button
                                            type="button"
                                            onClick={handleOpenCreate}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#004C4B] dark:border-[#00E5A3] text-xs font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:bg-[#E8F2EF] dark:hover:bg-[#142623] transition cursor-pointer"
                                        >
                                            <Plus size={13} />
                                            <span>Create First Rule</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                /* Rules List */
                                <div className="space-y-3">
                                    {rules.map((rule) => (
                                        <div
                                            key={rule.id}
                                            className={`rounded-xl border p-4 space-y-3 transition ${
                                                rule.isEnabled
                                                    ? "border-gray-200 dark:border-gray-800 bg-[#EEF4F1]/40 dark:bg-[#142623]/30"
                                                    : "border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/30 opacity-75"
                                            }`}
                                        >
                                            {/* Rule Header */}
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                        {rule.name}
                                                    </span>

                                                    {/* Target State Pill */}
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            rule.targetState
                                                                ? "bg-[#D7E8DF] text-[#1E5440] dark:bg-[#1C3A32] dark:text-[#6EE7B7]"
                                                                : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                                        }`}
                                                    >
                                                        Target: {rule.targetState ? "ON" : "OFF"}
                                                    </span>

                                                    {/* Match Type Badge */}
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                                                        {rule.matchType?.toLowerCase() === "any"
                                                            ? "Match ANY (OR)"
                                                            : "Match ALL (AND)"}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {canManage && (
                                                        <>
                                                            {/* Enabled / Disabled Toggle */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQuickToggleEnabled(rule)}
                                                                disabled={actionLoading}
                                                                title={rule.isEnabled ? "Click to disable rule" : "Click to enable rule"}
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                                                                    rule.isEnabled
                                                                        ? "bg-[#004C4B] text-white dark:bg-[#00E5A3] dark:text-[#001A1A]"
                                                                        : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                                }`}
                                                            >
                                                                <Power size={11} />
                                                                <span>{rule.isEnabled ? "Enabled" : "Disabled"}</span>
                                                            </button>

                                                            {/* Vertical Dots Options Menu */}
                                                            <div className="relative">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveMenuRuleId((prev) => (prev === rule.id ? null : rule.id));
                                                                    }}
                                                                    className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800 cursor-pointer transition"
                                                                    title="More options"
                                                                    aria-label="Rule options"
                                                                >
                                                                    <MoreVertical size={14} />
                                                                </button>

                                                                {activeMenuRuleId === rule.id && (
                                                                    <div
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setActiveMenuRuleId(null);
                                                                                handleOpenEdit(rule);
                                                                            }}
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#E8F2EF] dark:hover:bg-[#102A27] hover:text-[#004C4B] dark:hover:text-[#00E5A3] transition text-left cursor-pointer"
                                                                        >
                                                                            <Pencil size={12} />
                                                                            <span>Edit Rule</span>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setActiveMenuRuleId(null);
                                                                                setDeletingRuleId(rule.id);
                                                                            }}
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                            <span>Delete Rule</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delete Confirmation Prompt */}
                                            {deletingRuleId === rule.id && (
                                                <div className="flex items-center justify-between rounded-lg bg-red-50 dark:bg-red-950/40 p-2.5 border border-red-200 dark:border-red-900/60 text-xs">
                                                    <span className="text-red-700 dark:text-red-300">
                                                        Are you sure you want to delete this rule?
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingRuleId(null)}
                                                            disabled={actionLoading}
                                                            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(rule.id)}
                                                            disabled={actionLoading}
                                                            className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer"
                                                        >
                                                            {actionLoading ? "Deleting…" : "Confirm Delete"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Conditions List */}
                                            <div className="rounded-lg bg-white/70 dark:bg-[#1A1A1E]/80 border border-gray-100 dark:border-gray-800 p-2.5 space-y-1.5">
                                                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Conditions ({rule.conditions.length}):
                                                </span>
                                                <div className="space-y-1">
                                                    {rule.conditions.map((c, i) => (
                                                        <div
                                                            key={c.id || i}
                                                            className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300"
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full bg-[#004C4B] dark:bg-[#00E5A3]" />
                                                            <span className="font-medium">
                                                                {getSensorLabel(c.sensorId)}
                                                            </span>
                                                            <span className="font-mono font-bold text-[#004C4B] dark:text-[#00E5A3]">
                                                                {c.operator}
                                                            </span>
                                                            <span className="font-semibold">
                                                                {c.threshold}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* View: Create / Edit Rule Form */}
                    {view !== "list" && (
                        <form onSubmit={handleSaveRule} className="space-y-4">
                            <button
                                type="button"
                                onClick={() => setView("list")}
                                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition cursor-pointer"
                            >
                                <ArrowLeft size={13} />
                                <span>Back to Rules List</span>
                            </button>

                            {formError && (
                                <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {/* Rule Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Rule Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. Turn On When High Temp"
                                    maxLength={64}
                                    required
                                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1E] text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004C4B]/20 dark:focus:ring-[#00E5A3]/20 focus:border-[#004C4B] dark:focus:border-[#00E5A3]"
                                />
                                <span className="text-[10px] text-gray-400">
                                    Max 64 characters, must be unique for this actuator.
                                </span>
                            </div>

                            {/* Target State & Match Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Target State */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Target Actuator State
                                    </label>
                                    <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 dark:bg-gray-800/60 p-1 border border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={() => setFormTargetState(false)}
                                            className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                                !formTargetState
                                                    ? "bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900 shadow-xs"
                                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                                            }`}
                                        >
                                            Turn OFF
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormTargetState(true)}
                                            className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                                formTargetState
                                                    ? "bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] shadow-xs"
                                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                                            }`}
                                        >
                                            Turn ON
                                        </button>
                                    </div>
                                </div>

                                {/* Match Type */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Condition Matching
                                    </label>
                                    <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 dark:bg-gray-800/60 p-1 border border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={() => setFormMatchType("All")}
                                            className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                                formMatchType === "All"
                                                    ? "bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] shadow-xs"
                                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                                            }`}
                                        >
                                            ALL (AND)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormMatchType("Any")}
                                            className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                                formMatchType === "Any"
                                                    ? "bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] shadow-xs"
                                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                                            }`}
                                        >
                                            ANY (OR)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Is Enabled */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="form-rule-enabled"
                                    checked={formIsEnabled}
                                    onChange={(e) => setFormIsEnabled(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#004C4B] focus:ring-[#004C4B] cursor-pointer"
                                />
                                <label
                                    htmlFor="form-rule-enabled"
                                    className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                    Enable this rule immediately
                                </label>
                            </div>

                            {/* Conditions Header */}
                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                                        Conditions ({formConditions.length} / 5)
                                    </label>
                                    {formConditions.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={handleAddCondition}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#004C4B] dark:text-[#00E5A3] hover:underline cursor-pointer"
                                        >
                                            <Plus size={13} />
                                            <span>Add Condition</span>
                                        </button>
                                    )}
                                </div>

                                {/* Conditions List */}
                                <div className="space-y-2.5">
                                    {formConditions.map((cond, idx) => {
                                        const selectedSensor = sensors.find((s) => s.id === Number(cond.sensorId));
                                        return (
                                            <div
                                                key={idx}
                                                className="grid grid-cols-[1fr_auto_100px_auto] gap-2 items-center rounded-xl bg-gray-50/70 dark:bg-[#1A1A1E]/80 p-2.5 border border-gray-200 dark:border-gray-700"
                                            >
                                                {/* Sensor Selection */}
                                                <div>
                                                    <select
                                                        value={cond.sensorId}
                                                        onChange={(e) =>
                                                            handleConditionChange(
                                                                idx,
                                                                "sensorId",
                                                                Number(e.target.value)
                                                            )
                                                        }
                                                        className="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#121214] px-2.5 py-1.5 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#004C4B]"
                                                    >
                                                        {sensors.length === 0 ? (
                                                            <option value={0}>No sensors available</option>
                                                        ) : (
                                                            sensors.map((s) => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.name} ({s.sensorType})
                                                                    {!s.isOwnDevice ? ` • [Shared: ${s.deviceName}]` : ""}
                                                                    {s.unit ? ` [${s.unit}]` : ""}
                                                                </option>
                                                            ))
                                                        )}
                                                    </select>
                                                </div>

                                                {/* Operator Selection */}
                                                <div>
                                                    <select
                                                        value={cond.operator}
                                                        onChange={(e) =>
                                                            handleConditionChange(
                                                                idx,
                                                                "operator",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#121214] px-2 py-1.5 text-gray-800 dark:text-gray-100 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#004C4B]"
                                                    >
                                                        {OPERATORS.map((op) => (
                                                            <option key={op.value} value={op.value}>
                                                                {op.value}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Threshold Input */}
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        min="-9999999.999"
                                                        max="9999999.999"
                                                        value={cond.threshold}
                                                        onChange={(e) =>
                                                            handleConditionChange(
                                                                idx,
                                                                "threshold",
                                                                e.target.value === "" ? "" : Number(e.target.value)
                                                            )
                                                        }
                                                        required
                                                        placeholder="0"
                                                        className="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#121214] px-2.5 py-1.5 text-gray-800 dark:text-gray-100 font-semibold focus:outline-none focus:ring-1 focus:ring-[#004C4B]"
                                                    />
                                                    {selectedSensor?.unit && (
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">
                                                            {selectedSensor.unit}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Remove Condition */}
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCondition(idx)}
                                                        disabled={formConditions.length <= 1}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                                                        title="Remove condition"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Form Footer */}
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setView("list")}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-5 py-2 rounded-xl bg-[#004C4B] dark:bg-[#00E5A3] text-white dark:text-[#001A1A] text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                                >
                                    {actionLoading ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Saving…</span>
                                        </>
                                    ) : (
                                        <span>{view === "create" ? "Create Rule" : "Update Rule"}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Modal Footer (List View) */}
                {view === "list" && (
                    <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-[#151518]/50">
                        <div className="flex items-center gap-1.5">
                            <Info size={13} className="text-[#004C4B] dark:text-[#00E5A3]" />
                            <span>Rules execute automatically when mode is Auto</span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
