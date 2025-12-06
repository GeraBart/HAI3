/**
 * Home Screen
 * Main dashboard screen with analytics charts and drag-drop reordering
 */

import React from 'react';
import {
  useTranslation,
  TextLoader,
  useScreenTranslations,
  I18nRegistry,
  Language,
  useAppSelector,
} from '@hai3/uicore';
import { Card, CardContent, CardHeader, CardTitle, Avatar, AvatarFallback, Badge } from '@hai3/uikit';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { DASHBOARDS_SCREENSET_ID, HOME_SCREEN_ID } from '../../ids';
import { selectChartOrder, CHART_IDS, type ChartId } from '../../slices/dashboardsSlice';
import { reorderCharts } from '../../actions/dashboardsActions';
import { DraggableCard } from './components/DraggableCard';

/**
 * Screen-level translations (loaded lazily when screen mounts)
 */
const translations = I18nRegistry.createLoader({
  [Language.English]: () => import('./i18n/en.json'),
  [Language.Arabic]: () => import('./i18n/ar.json'),
  [Language.Bengali]: () => import('./i18n/bn.json'),
  [Language.Czech]: () => import('./i18n/cs.json'),
  [Language.Danish]: () => import('./i18n/da.json'),
  [Language.German]: () => import('./i18n/de.json'),
  [Language.Greek]: () => import('./i18n/el.json'),
  [Language.Spanish]: () => import('./i18n/es.json'),
  [Language.Persian]: () => import('./i18n/fa.json'),
  [Language.Finnish]: () => import('./i18n/fi.json'),
  [Language.French]: () => import('./i18n/fr.json'),
  [Language.Hebrew]: () => import('./i18n/he.json'),
  [Language.Hindi]: () => import('./i18n/hi.json'),
  [Language.Hungarian]: () => import('./i18n/hu.json'),
  [Language.Indonesian]: () => import('./i18n/id.json'),
  [Language.Italian]: () => import('./i18n/it.json'),
  [Language.Japanese]: () => import('./i18n/ja.json'),
  [Language.Korean]: () => import('./i18n/ko.json'),
  [Language.Malay]: () => import('./i18n/ms.json'),
  [Language.Dutch]: () => import('./i18n/nl.json'),
  [Language.Norwegian]: () => import('./i18n/no.json'),
  [Language.Polish]: () => import('./i18n/pl.json'),
  [Language.Portuguese]: () => import('./i18n/pt.json'),
  [Language.Romanian]: () => import('./i18n/ro.json'),
  [Language.Russian]: () => import('./i18n/ru.json'),
  [Language.Swedish]: () => import('./i18n/sv.json'),
  [Language.Swahili]: () => import('./i18n/sw.json'),
  [Language.Tamil]: () => import('./i18n/ta.json'),
  [Language.Thai]: () => import('./i18n/th.json'),
  [Language.Tagalog]: () => import('./i18n/tl.json'),
  [Language.Turkish]: () => import('./i18n/tr.json'),
  [Language.Ukrainian]: () => import('./i18n/uk.json'),
  [Language.Urdu]: () => import('./i18n/ur.json'),
  [Language.Vietnamese]: () => import('./i18n/vi.json'),
  [Language.ChineseSimplified]: () => import('./i18n/zh.json'),
  [Language.ChineseTraditional]: () => import('./i18n/zh-TW.json'),
});

// Mock data for line chart (monthly revenue)
const revenueData = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 5000, expenses: 3800 },
  { month: 'Apr', revenue: 4780, expenses: 3908 },
  { month: 'May', revenue: 5890, expenses: 4800 },
  { month: 'Jun', revenue: 6390, expenses: 3800 },
  { month: 'Jul', revenue: 7490, expenses: 4300 },
];

// Mock data for pie chart (traffic sources)
const trafficData = [
  { name: 'Direct', value: 400, color: 'hsl(var(--chart-1))' },
  { name: 'Organic', value: 300, color: 'hsl(var(--chart-2))' },
  { name: 'Referral', value: 200, color: 'hsl(var(--chart-3))' },
  { name: 'Social', value: 150, color: 'hsl(var(--chart-4))' },
];

// Mock data for second pie chart (device breakdown)
const deviceData = [
  { name: 'Desktop', value: 55, color: 'hsl(var(--chart-1))' },
  { name: 'Mobile', value: 35, color: 'hsl(var(--chart-2))' },
  { name: 'Tablet', value: 10, color: 'hsl(var(--chart-3))' },
];

// Stats cards data
const statsData = [
  { label: 'total_revenue', value: '$45,231.89', change: '+20.1%' },
  { label: 'subscriptions', value: '+2,350', change: '+180.1%' },
  { label: 'sales', value: '+12,234', change: '+19%' },
  { label: 'active_users', value: '+573', change: '+201' },
];

/**
 * Stats Card Component (non-draggable)
 */
const StatsCards: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {statsData.map((stat) => (
      <Card key={stat.label}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <TextLoader skeletonClassName="h-4 w-24">
              {t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:stats.${stat.label}`)}
            </TextLoader>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stat.value}</div>
          <p className="text-xs text-muted-foreground">
            <Badge variant="secondary" className="bg-success/10 text-success border-0 mr-1">
              {stat.change}
            </Badge>
            <TextLoader skeletonClassName="h-3 w-16 inline-block">
              {t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:from_last_month`)}
            </TextLoader>
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);

/**
 * Revenue Chart Component
 */
const RevenueChart: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <DraggableCard id={CHART_IDS.REVENUE}>
    <CardHeader>
      <CardTitle>
        <TextLoader skeletonClassName="h-6 w-40">
          {t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:charts.revenue_overview`)}
        </TextLoader>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            wrapperClassName="rounded-lg"
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-1))' }}
            name={t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:charts.revenue`)}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-2))' }}
            name={t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:charts.expenses`)}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </DraggableCard>
);

/**
 * Traffic Sources Chart Component
 */
const TrafficChart: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <DraggableCard id={CHART_IDS.TRAFFIC}>
    <CardHeader>
      <CardTitle>
        <TextLoader skeletonClassName="h-6 w-32">
          {t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:charts.traffic_sources`)}
        </TextLoader>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={trafficData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {trafficData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            wrapperClassName="rounded-lg"
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </DraggableCard>
);

/**
 * Device Breakdown Chart Component
 */
const DevicesChart: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <DraggableCard id={CHART_IDS.DEVICES}>
    <CardHeader>
      <CardTitle>
        <TextLoader skeletonClassName="h-6 w-40">
          {t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:charts.device_breakdown`)}
        </TextLoader>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={deviceData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {deviceData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            wrapperClassName="rounded-lg"
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </DraggableCard>
);

/**
 * Recent Activity Component
 */
const ActivityCard: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <DraggableCard id={CHART_IDS.ACTIVITY}>
    <CardHeader>
      <CardTitle>
        <TextLoader skeletonClassName="h-6 w-32">
          {t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:recent_activity`)}
        </TextLoader>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback>U{i}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                <TextLoader skeletonClassName="h-4 w-32">
                  {t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:activity.user_action`).replace('{{num}}', String(i))}
                </TextLoader>
              </p>
              <p className="text-sm text-muted-foreground">
                {i * 2} min ago
              </p>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success border-0">
              +${(Math.random() * 100).toFixed(2)}
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </DraggableCard>
);

/**
 * Chart components map
 */
const chartComponents: Record<ChartId, React.FC<{ t: (key: string) => string }>> = {
  [CHART_IDS.STATS]: StatsCards,
  [CHART_IDS.REVENUE]: RevenueChart,
  [CHART_IDS.TRAFFIC]: TrafficChart,
  [CHART_IDS.DEVICES]: DevicesChart,
  [CHART_IDS.ACTIVITY]: ActivityCard,
};

/**
 * Home Screen Component
 */
export const HomeScreen: React.FC = () => {
  // Register translations for this screen
  useScreenTranslations(DASHBOARDS_SCREENSET_ID, HOME_SCREEN_ID, translations);

  const { t } = useTranslation();
  const chartOrder = useAppSelector(selectChartOrder);

  // Drag-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = chartOrder.indexOf(active.id as ChartId);
      const newIndex = chartOrder.indexOf(over.id as ChartId);
      const newOrder = arrayMove(chartOrder, oldIndex, newIndex);
      reorderCharts(newOrder);
    }
  };

  // Filter draggable charts (exclude stats which stays at top)
  const draggableCharts = chartOrder.filter((id) => id !== CHART_IDS.STATS);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <TextLoader skeletonClassName="h-10 w-64">
          <h1 className="text-3xl font-bold tracking-tight">
            {t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:title`)}
          </h1>
        </TextLoader>
        <TextLoader skeletonClassName="h-5 w-96">
          <p className="text-muted-foreground">
            {t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:description`)}
          </p>
        </TextLoader>
        <p className="text-xs text-muted-foreground mt-2">
          <TextLoader skeletonClassName="h-3 w-48">
            {t(`screen.${DASHBOARDS_SCREENSET_ID}.${HOME_SCREEN_ID}:drag_hint`)}
          </TextLoader>
        </p>
      </div>

      {/* Stats Cards (non-draggable, always first) */}
      <StatsCards t={t} />

      {/* Draggable Charts */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={draggableCharts} strategy={rectSortingStrategy}>
          <div className="grid gap-4 md:grid-cols-2">
            {draggableCharts.map((chartId) => {
              const ChartComponent = chartComponents[chartId];
              return <ChartComponent key={chartId} t={t} />;
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

HomeScreen.displayName = 'HomeScreen';

// Default export for lazy loading
export default HomeScreen;
