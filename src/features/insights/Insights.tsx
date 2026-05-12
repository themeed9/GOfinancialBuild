import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Transaction, Category } from '../../types';
import type { CurrencyOption } from '../../data/currencies';
import type { Budget, BudgetPeriod } from '../../types/budget';
import { getCurrencyISOCode } from '../../data/currencies';
import { convertCurrency } from '../../utils/currency';
import { useI18n } from '../../hooks/useI18n';
import BudgetModal from './BudgetModal';
import styles from './Insights.module.css';
import { MdChevronRight, MdErrorOutline } from 'react-icons/md';

type Period = 'week' | 'month';

// SVG Pie Constants
const PIE_SIZE = 220;
const PIE_CX = 110;
const PIE_CY = 110;
const PIE_R = 100;

interface InsightsProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyOption;
  budget: Budget | null;
  onSetBudget?: (amount: number, period: BudgetPeriod) => void;
  onClearBudget?: () => void;
  onViewAll?: () => void;
}

interface ChartPoint {
  label: string;
  value: number;
}

const CHART_HEIGHT = 165;
const CHART_PAD_TOP = 40;
const CHART_PAD_BOTTOM = 22;

const CATEGORY_PILL_MAP: Record<string, string> = {
  'food-dining': 'categoryFood',
  'transport': 'categoryTransport',
  'shopping': 'categoryShopping',
  'bills': 'categoryBills',
  'entertainment': 'categoryEntertainment',
  'health': 'categoryHealth',
  'education': 'categoryEducation',
  'other': 'categoryOther',
};

function getCategoryPillClass(categoryId: string): string {
  return CATEGORY_PILL_MAP[categoryId] || 'categoryOther';
}

function formatAmount(amount: number, currency: CurrencyOption): string {
  const code = getCurrencyISOCode(currency);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
  }
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}


export default function Insights({
  transactions,
  categories,
  currency,
  budget,
  onSetBudget,
  onClearBudget,
  onViewAll,
}: InsightsProps) {
  const { strings } = useI18n();
  const [period, setPeriod] = useState<Period>('week');
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const targetISO = useMemo(() => getCurrencyISOCode(currency), [currency]);

  const convertedTxns = useMemo(() =>
    transactions.map(t => ({
      ...t,
      convertedAmount: convertCurrency(t.amount, t.originalCurrency || targetISO, currency),
    })),
  [transactions, targetISO, currency]);

  // ── Chart Data ──
  const chartData = useMemo((): ChartPoint[] => {
    const now = new Date();

    if (period === 'week') {
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return Array.from({ length: 7 }, (_, d) => {
        const day = new Date(now);
        day.setDate(now.getDate() - now.getDay() + d);
        const dayStart = startOfDay(day);
        const total = convertedTxns
          .filter(t => t.timestamp >= dayStart.getTime() && t.timestamp < dayStart.getTime() + 86400000)
          .reduce((s, t) => s + t.convertedAmount, 0);
        return { label: dayLabels[d], value: total };
      });
    }

    const year = now.getFullYear();
    const month = now.getMonth();
    const dim = new Date(year, month + 1, 0).getDate();
    const weeks: { start: number; end: number }[] = [];
    for (let d = 1; d <= dim; d += 7) {
      weeks.push({
        start: new Date(year, month, d).getTime(),
        end: new Date(year, month, Math.min(d + 6, dim) + 1).getTime(),
      });
    }
    return weeks.map((w, i) => ({
      label: `Wk${i + 1}`,
      value: convertedTxns
        .filter(t => t.timestamp >= w.start && t.timestamp < w.end)
        .reduce((s, t) => s + t.convertedAmount, 0),
    }));
  }, [period, convertedTxns]);

  // ── Period total ──
  const periodTotal = useMemo(() =>
    chartData.reduce((s, d) => s + d.value, 0),
  [chartData]);

  // ── Budget spending for current budget period ──
  const budgetSpent = useMemo(() => {
    if (!budget) return 0;
    const now = new Date();
    let start = 0;
    switch (budget.period) {
      case 'day': start = startOfDay(now).getTime(); break;
      case 'week': { const d = new Date(now); d.setDate(d.getDate() - d.getDay()); start = startOfDay(d).getTime(); break; }
      case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1).getTime(); break;
      case 'year': start = new Date(now.getFullYear(), 0, 1).getTime(); break;
    }
    return convertedTxns
      .filter(t => t.timestamp >= start)
      .reduce((s, t) => s + t.convertedAmount, 0);
  }, [budget, convertedTxns]);

  // ── SVG chart geometry ──
  const chartGeometry = useMemo(() => {
    if (!chartData.length) return null;

    const count = chartData.length;
    const viewWidth = 300;
    const drawHeight = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
    const maxVal = Math.max(...chartData.map(d => d.value), 1);

    const points = chartData.map((d, i) => ({
      x: count > 1 ? 10 + (i / (count - 1)) * (viewWidth - 20) : viewWidth / 2,
      y: CHART_PAD_TOP + drawHeight - (d.value / maxVal) * drawHeight,
    }));

    const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
    const bottomY = CHART_HEIGHT - CHART_PAD_BOTTOM;
    const fillPoints = `${points[0].x},${bottomY} ${polyline} ${points[points.length - 1].x},${bottomY}`;

    const gridLines = [1, 2, 3].map(i =>
      CHART_PAD_TOP + drawHeight - (i / 3) * drawHeight
    );

    const labelIndices: number[] = [];
    if (count <= 12) {
      for (let i = 0; i < count; i++) labelIndices.push(i);
    } else {
      const step = Math.ceil(count / 8);
      for (let i = 0; i < count; i += step) labelIndices.push(i);
      if (labelIndices[labelIndices.length - 1] !== count - 1) labelIndices.push(count - 1);
    }

    const lastPoint = points[points.length - 1];
    const lastValue = chartData[chartData.length - 1].value;

    return { points, polyline, fillPoints, bottomY, gridLines, labelIndices, viewWidth, lastPoint, lastValue };
  }, [chartData]);

  const periodTransactions = useMemo(() => {
    const now = new Date();
    let start = 0;
    if (period === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      start = startOfDay(d).getTime();
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    }
    return convertedTxns.filter(t => t.timestamp >= start);
  }, [period, convertedTxns]);

  // ── Category breakdown ──
  const categoryBreakdown = useMemo(() => {
    const groups = new Map<string, number>();
    periodTransactions.forEach(t => {
      groups.set(t.categoryId, (groups.get(t.categoryId) || 0) + t.convertedAmount);
    });
    return Array.from(groups.entries())
      .map(([id, total]) => {
        const cat = categories.find(c => c.id === id);
        return { id, name: cat?.name || id, icon: cat?.icon || '📌', total };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [periodTransactions, categories]);

  const categoryMax = useMemo(() =>
    Math.max(...categoryBreakdown.map(c => c.total), 1),
  [categoryBreakdown]);

  const categoryTotal = useMemo(() =>
    periodTransactions.reduce((s, t) => s + t.convertedAmount, 0),
  [periodTransactions]);

  // ── Recent transactions ──
  const recentTransactions = useMemo(() =>
    [...periodTransactions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8),
  [periodTransactions]);

  // ── Tooltip ──
  const handleChartHover = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartGeometry || !chartData.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * chartGeometry.viewWidth;
    const idx = Math.round(((svgX - 10) / (chartGeometry.viewWidth - 20)) * (chartData.length - 1));
    const point = chartData[Math.max(0, Math.min(chartData.length - 1, idx))];
    if (point && point.value > 0) {
      setTooltip({ text: `${point.label}: ${formatAmount(point.value, currency)}`, x: e.clientX, y: e.clientY });
    } else {
      setTooltip(null);
    }
  }, [chartData, chartGeometry, currency]);

  const handleChartLeave = useCallback(() => setTooltip(null), []);

  const handleBudgetSave = useCallback((amount: number, budgetPeriod: BudgetPeriod) => {
    onSetBudget?.(amount, budgetPeriod);
    setShowBudgetModal(false);
  }, [onSetBudget]);

  const handleBudgetClear = useCallback(() => {
    onClearBudget?.();
    setShowBudgetModal(false);
  }, [onClearBudget]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{strings.nav_insight || 'Insights'}</h1>
      </div>

      {/* ── Chart Card ── */}
      <div className={styles.chartCard}>
        <div className={styles.periodTabs} role="tablist" aria-label="Time period">
          {(['week', 'month'] as Period[]).map(p => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              className={`${styles.periodTab} ${period === p ? styles.periodTabActive : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        {chartData.length > 0 && chartGeometry ? (
          <div ref={chartRef} className={styles.chartSvgWrapper}>
            <svg
              viewBox={`0 0 ${chartGeometry.viewWidth} ${CHART_HEIGHT}`}
              className={styles.chartSvg}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={`${period} spending chart`}
              onMouseMove={handleChartHover}
              onMouseLeave={handleChartLeave}
            >
              <defs>
                <linearGradient id="insightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {chartGeometry.gridLines.map((y, i) => (
                <line key={i} x1="10" y1={y} x2={chartGeometry.viewWidth - 10} y2={y} className={styles.chartGridLine} />
              ))}

              <polygon points={chartGeometry.fillPoints} fill="url(#insightGradient)" className={styles.chartFill} />
              <polyline points={chartGeometry.polyline} className={styles.chartLine} />

              {chartGeometry.points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={2.5} className={styles.chartDotSmall} />
              ))}

              {chartGeometry.labelIndices.map(i => (
                <text key={i} x={chartGeometry.points[i].x} y={CHART_HEIGHT - 4} className={styles.chartLabel}>
                  {chartData[i].label}
                </text>
              ))}

              {/* Endpoint callout */}
              {(() => {
                const lp = chartGeometry.lastPoint;
                const lv = chartGeometry.lastValue;
                if (!lp || lv <= 0) return null;
                const label = formatAmount(periodTotal, currency);
                const charW = 7.5;
                const pillW = Math.max(label.length * charW + 16, 60);
                const pillH = 22;
                const pillR = 6;
                const pillX = Math.min(Math.max(lp.x - pillW / 2, 4), chartGeometry.viewWidth - pillW - 4);
                const pillY = Math.max(lp.y - pillH - 10, 2);
                const arrowBaseY = pillY + pillH;
                return (
                  <g>
                    <polygon
                      points={`${lp.x - 5},${arrowBaseY} ${lp.x + 5},${arrowBaseY} ${lp.x},${lp.y - 3}`}
                      className={styles.endpointArrow}
                    />
                    <rect x={pillX} y={pillY} width={pillW} height={pillH} rx={pillR} className={styles.endpointPill} />
                    <text x={pillX + pillW / 2} y={pillY + pillH / 2 + 4} className={styles.endpointLabel}>
                      {label}
                    </text>
                    <circle cx={lp.x} cy={lp.y} r={5} className={styles.endpointDotOuter} />
                    <circle cx={lp.x} cy={lp.y} r={3} className={styles.endpointDotInner} />
                  </g>
                );
              })()}
            </svg>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📊</span>
            <p className={styles.emptyText}>No spending data yet</p>
            <p className={styles.emptyHint}>Add transactions to see your trends</p>
          </div>
        )}

        {tooltip && (
          <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
            {tooltip.text}
          </div>
        )}
      </div>

      {/* ── Budget Section ── */}
      {budget ? (
        <BudgetPieCard
          spent={budgetSpent}
          budget={budget.amount}
          currency={currency}
          onAdjust={() => setShowBudgetModal(true)}
        />
      ) : (
        <div className={styles.budgetCta}>
          <button
            className={styles.budgetCtaButton}
            onClick={() => setShowBudgetModal(true)}
            aria-label="Set a budget"
          >
            Set Budget
          </button>
          <p className={styles.budgetCtaHint}>
            Track your spending limits — tap to set a budget.
          </p>
        </div>
      )}

      {/* ── Top Categories ── */}
      {categoryBreakdown.length > 0 && (
        <div className={styles.topCategoriesCard}>
          <h2 className={styles.topCategoriesTitle}>Top Categories</h2>
          <div className={styles.categoryList}>
            {categoryBreakdown.map(cat => {
              const widthPct = (cat.total / categoryMax) * 100;
              const pct = categoryTotal > 0 ? Math.round((cat.total / categoryTotal) * 100) : 0;
              return (
                <div key={cat.id} className={styles.categoryItem}>
                  <div className={styles.categoryIcon}>{cat.icon}</div>
                  <div className={styles.categoryInfo}>
                    <div className={styles.categoryName}>{cat.name}</div>
                    <div className={styles.categoryBarTrack}>
                      <div className={styles.categoryBarFill} style={{ width: `${Math.max(widthPct, 3)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className={styles.categoryAmount}>{formatAmount(cat.total, currency)}</div>
                    <div className={styles.categoryPercent}>{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent Expenses ── */}
      <div className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h2 className={styles.recentTitle}>Recent Expenses</h2>
          {recentTransactions.length > 0 && (
            <button className={styles.viewAllBtn} onClick={onViewAll} aria-label="View all expenses">
              View all <MdChevronRight size={16} />
            </button>
          )}
        </div>

        {recentTransactions.length > 0 ? (
          <div className={styles.expenseList}>
            {recentTransactions.map(txn => {
              const cat = categories.find(c => c.id === txn.categoryId);
              const pillClass = getCategoryPillClass(txn.categoryId);
              return (
                <div key={txn.id} className={styles.expenseItem}>
                  <div className={styles.expenseIcon}>{cat?.icon || '📌'}</div>
                  <div className={styles.expenseInfo}>
                    <div className={styles.expenseTopRow}>
                      <span className={`${styles.categoryPill} ${styles[pillClass]}`}>
                        {cat?.name || 'Other'}
                      </span>
                    </div>
                    <div className={styles.expenseDescription}>{txn.note || cat?.name || 'Expense'}</div>
                  </div>
                  <div className={styles.expenseRight}>
                    <span className={styles.expenseAmount}>{formatAmount(txn.convertedAmount, currency)}</span>
                    <span className={styles.expenseDate}>{formatDate(txn.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <p className={styles.emptyText}>No expenses yet</p>
            <p className={styles.emptyHint}>Start tracking to see your spending</p>
          </div>
        )}
      </div>

      {/* ── Budget Modal ── */}
      {showBudgetModal && (
        <BudgetModal
          budget={budget}
          currency={currency}
          onSave={handleBudgetSave}
          onClear={onClearBudget ? handleBudgetClear : undefined}
          onClose={() => setShowBudgetModal(false)}
        />
      )}
    </div>
  );
}

// ── BudgetPieCard ─────────
interface BudgetPieCardProps {
  spent: number;
  budget: number;
  currency: CurrencyOption;
  onAdjust: () => void;
}

function BudgetPieCard({ spent, budget, currency, onAdjust }: BudgetPieCardProps) {
  const spentPct = budget > 0 ? spent / budget : 0;
  const isOver = spent > budget;

  const visualSpentPct = Math.min(spentPct, 1);
  const remainingPct = 1 - visualSpentPct;

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setTimeout(() => setAnimated(true), 50);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const getSlicePath = (startPct: number, endPct: number) => {
    if (endPct - startPct >= 0.9999) {
      return `M ${PIE_CX} ${PIE_CY - PIE_R} A ${PIE_R} ${PIE_R} 0 1 1 ${PIE_CX - 0.01} ${PIE_CY - PIE_R} Z`;
    }
    const startAngle = (startPct * 360 - 90) * (Math.PI / 180);
    const endAngle = (endPct * 360 - 90) * (Math.PI / 180);
    const x1 = PIE_CX + PIE_R * Math.cos(startAngle);
    const y1 = PIE_CY + PIE_R * Math.sin(startAngle);
    const x2 = PIE_CX + PIE_R * Math.cos(endAngle);
    const y2 = PIE_CY + PIE_R * Math.sin(endAngle);
    const largeArc = endPct - startPct > 0.5 ? 1 : 0;
    return `M ${PIE_CX} ${PIE_CY} L ${x1} ${y1} A ${PIE_R} ${PIE_R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const getLabelPos = (startPct: number, endPct: number) => {
    const midAngle = ((startPct + (endPct - startPct) / 2) * 360 - 90) * (Math.PI / 180);
    const r = PIE_R * 0.6;
    return {
      x: PIE_CX + r * Math.cos(midAngle),
      y: PIE_CY + r * Math.sin(midAngle)
    };
  };

  const spentSliceEnd = animated ? visualSpentPct : 0;
  const spentLabel = getLabelPos(0, visualSpentPct);
  const remainingLabel = getLabelPos(visualSpentPct, 1);

  const spentPercentText = `${Math.round(spentPct * 100)}%`;
  const remainingPercentText = `${Math.round(remainingPct * 100)}%`;

  return (
    <div className={styles.budgetPieCard}>
      <div className={styles.budgetPieRow}>
        <div className={styles.budgetPieWrapper} aria-hidden="true">
          <svg width={PIE_SIZE} height={PIE_SIZE} viewBox={`0 0 ${PIE_SIZE} ${PIE_SIZE}`}>
            <path
              d={getSlicePath(0, 1)}
              fill="var(--color-secondary-container)"
              stroke="var(--color-surface)"
              strokeWidth="1"
            />
            {visualSpentPct > 0 && (
              <path
                d={getSlicePath(0, spentSliceEnd)}
                fill="var(--color-primary)"
                stroke="var(--color-surface)"
                strokeWidth="1"
                style={{ transition: 'd 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            )}

            {animated && (
              <>
                {visualSpentPct > 0.15 && (
                  <text
                    x={spentLabel.x}
                    y={spentLabel.y}
                    className={styles.pieLabel}
                    dominantBaseline="middle"
                    textAnchor="middle"
                  >
                    {spentPercentText}
                  </text>
                )}
                {remainingPct > 0.15 && !isOver && (
                  <text
                    x={remainingLabel.x}
                    y={remainingLabel.y}
                    className={styles.pieLabel}
                    dominantBaseline="middle"
                    textAnchor="middle"
                    style={{ fill: 'var(--color-on-secondary-container)' }}
                  >
                    {remainingPercentText}
                  </text>
                )}
              </>
            )}
          </svg>
        </div>

        <div className={styles.budgetPieLegend}>
          <div className={styles.budgetLegendItem}>
            <div className={styles.budgetLegendLabel}>Spent</div>
            <div className={styles.budgetLegendValue}>
              {formatAmount(spent, currency)} <span className={styles.budgetLegendPct}>({spentPercentText})</span>
            </div>
          </div>

          <div className={styles.budgetLegendItem}>
            <div className={styles.budgetLegendLabel}>{isOver ? 'Overspent' : 'Remaining'}</div>
            <div className={`${styles.budgetLegendValue} ${isOver ? styles.budgetOverValue : ''}`}>
              {formatAmount(isOver ? spent - budget : Math.max(budget - spent, 0), currency)}
              {!isOver && <span className={styles.budgetLegendPct}> ({remainingPercentText})</span>}
            </div>
          </div>
        </div>
      </div>

      {isOver && (
        <div className={styles.budgetOverBanner}>
          <MdErrorOutline size={16} /><span>Budget exceeded by {formatAmount(spent - budget, currency)}</span>
        </div>
      )}

      <button className={styles.adjustBudgetBtn} onClick={onAdjust}>
        Adjust budget
      </button>
    </div>
  );
}
