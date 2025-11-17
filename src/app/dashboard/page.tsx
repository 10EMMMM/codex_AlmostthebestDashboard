"use client";

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  CalendarDays,
  Quote,
  Lightbulb,
  Flame,
  RefreshCw,
  Settings,
  Target,
  User,
  LayoutGrid,
  Leaf,
  TrendingUp,
  Clock,
  LineChart as LucideLineChart, // Aliased LineChart
  Mail,
  ArrowUp,
  Smile,
  Send,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, XAxis, Bar, BarChart, Line, LineChart as RechartsLineChart } from "recharts";
import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SplashScreen } from '@/components/ui/splash-screen';

const GreetingWidget = dynamic(() => import('@/components/greeting-widget').then(mod => mod.GreetingWidget), { ssr: false });
const Widget = dynamic(() => Promise.resolve(({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={cn(
      'widget bg-card rounded-xl p-6 flex flex-col border shadow-lg',
      className
    )}
  >
    {children}
  </div>
)), { ssr: false });

const FocusWidget = dynamic(() => Promise.resolve(() => (
  <Widget className="items-center justify-center">
    <div className="flex justify-between items-center w-full mb-4">
      <h2 className="text-base font-semibold text-primary uppercase tracking-wider flex items-center space-x-2">
        <Target className="w-5 h-5" />
        <span>TOTAL ONBOARDS</span>
      </h2>
    </div>
    <div className="relative w-full max-w-lg h-24 sm:h-32 flex items-center justify-center mb-4">
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <span className="text-7xl sm:text-9xl md:text-[8rem] font-extrabold leading-none">
          11
        </span>
      </div>
    </div>
    <div className="flex items-baseline justify-center">
      <span className="text-3xl font-bold mr-2">3 onboards</span>
      <span className="text-lg text-muted-foreground">this week</span>
    </div>
    <p className="text-sm text-muted-foreground mt-2">
      
    </p>
  </Widget>
)), { ssr: false });

const TimeWidget = dynamic(() => Promise.resolve(() => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date()); // Set initial time on client
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  if (!time) {
    return (
       <Widget className="items-center justify-center text-center">
        <div className="flex justify-between items-center w-full mb-4">
        <h3 className="text-base font-semibold text-primary uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Current Time</span>
        </h3>
      </div>
        <div className="text-5xl sm:text-6xl font-extrabold">--:--:--</div>
        <div className="text-xl sm:text-2xl text-muted-foreground mt-2">Loading...</div>
      </Widget>
    );
  }

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formattedDate = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Widget className="items-center justify-center text-center">
      <div className="flex justify-between items-center w-full mb-4">
        <h3 className="text-base font-semibold text-primary uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Current Time</span>
        </h3>
      </div>
      <div className="flex items-baseline">
        <span className="text-5xl sm:text-6xl font-extrabold">{formattedTime}</span>
      </div>
      <span className="text-xl sm:text-2xl text-muted-foreground mt-2">
        {formattedDate}
      </span>
    </Widget>
  );
}), { ssr: false });

const chartData = [
  { month: "January", tasks: 186 },
  { month: "February", tasks: 305 },
  { month: "March", tasks: 237 },
  { month: "April", tasks: 73 },
  { month: "May", tasks: 209 },
  { month: "June", tasks: 214 },
];

const chartConfig = {
  tasks: {
    label: "Tasks",
    color: "hsl(var(--primary))",
  },
};

const LineChartWidget = dynamic(() => Promise.resolve(() => (
  <Widget>
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-base text-primary uppercase tracking-wider flex items-center space-x-2">
        <LucideLineChart className="w-5 h-5" /> {/* Changed from LineChart */}
        <span>Tasks Completed</span>
      </h3>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
    <div className="flex-grow">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <RechartsLineChart
          accessibilityLayer
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Line
            dataKey="tasks"
            type="natural"
            stroke="var(--color-tasks)"
            strokeWidth={2}
            dot={{
              fill: "var(--color-tasks)",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </RechartsLineChart>
      </ChartContainer>
    </div>
    <Button variant="secondary" className="mt-4 w-full">
      <CalendarDays className="w-5 h-5 mr-2" />
      <span>View Full Report</span>
    </Button>
  </Widget>
)), { ssr: false });

const SalesReportWidget = dynamic(() => Promise.resolve(() => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);

  useEffect(() => {
    const generateData = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const colorClasses = [
        { color: 'bg-muted/20', textColor: 'text-muted-foreground' }, // 0-9
        { color: 'bg-sky-900/40', textColor: 'text-sky-300' }, // 10-19
        { color: 'bg-sky-900/60', textColor: 'text-sky-200' }, // 20-29
        { color: 'bg-sky-800/70', textColor: 'text-sky-100' }, // 30-39
        { color: 'bg-sky-700/80', textColor: 'text-white' }, // 40-49
        { color: 'bg-lime-400/30', textColor: 'text-lime-200' }, // 50-59
        { color: 'bg-lime-400/50', textColor: 'text-lime-100' }, // 60-69
        { color: 'bg-yellow-400/40', textColor: 'text-yellow-200' },// 70-79
        { color: 'bg-yellow-400/60', textColor: 'text-yellow-100' },// 80-89
        { color: 'bg-orange-500/70', textColor: 'text-orange-100' }, // >= 90
      ];

      const getColor = (value: number) => {
        if (value === 0) return colorClasses[0];
        const index = Math.floor(value / 10);
        return colorClasses[Math.min(index, colorClasses.length - 1)];
      }

      const data = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const randomValue = Math.floor(Math.random() * 100);
        const { color, textColor } = getColor(randomValue);
        return { value: day, color, textColor, randomValue };
      });

      setSalesData(data);

      const locations = [
          { name: "Los Angeles", value: 201192 },
          { name: "New York", value: 192054 },
          { name: "Canada", value: 166401 },
          { name: "Dallas", value: 154321 },
      ];
      setLocationData(locations);
    };

    generateData();
  }, []);

  return (
    <Widget>
      <header>
        <h1 className="text-xl font-bold font-sans mb-4">Onboard Report</h1>
      </header>
      <main className="space-y-4 text-sm">
        <section>
          <div className="grid grid-cols-7 gap-1">
            {salesData.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'aspect-square flex items-center justify-center rounded-md text-xs',
                  item.color,
                  item.textColor
                )}
                title={`Value: ${item.randomValue}`}
              >
                {item.value}
              </div>
            ))}
          </div>
        </section>
        <section className="flex space-x-4">
          <div className="w-1/2">
            <div className="flex items-center space-x-2 text-muted-foreground mb-1">
              <TrendingUp className="text-green-500 w-4 h-4" />
              <span className="text-xs font-medium">Yearly</span>
            </div>
            <p className="text-xl font-bold">$301,002</p>
          </div>
          <div className="w-1/2">
            <div className="flex items-center space-x-2 text-muted-foreground mb-1">
              <TrendingUp className="text-green-500 w-4 h-4" />
              <span className="text-xs font-medium">Monthly</span>
            </div>
            <p className="text-xl font-bold">$8,097</p>
          </div>
        </section>
        <section className="pt-2">
          <ul className="space-y-2">
            {locationData.map((location, index) => (
                <React.Fragment key={location.name}>
                    <li className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{location.name}</span>
                        <span className="font-medium">{location.value.toLocaleString()}</span>
                    </li>
                    {index < locationData.length - 1 && <hr className="border-border" />}
                </React.Fragment>
            ))}
          </ul>
        </section>
      </main>
    </Widget>
  );
}), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasAdminAccess, loading } = useAuth();
  const [gridElement, setGridElement] = useState<HTMLElement | null>(null);
  const [metrics, setMetrics] = useState<{
    card: { width: number; height: number } | null;
    inner: { width: number; height: number } | null;
    grid: { width: number; height: number } | null;
  }>({
    card: null,
    inner: null,
    grid: null,
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
      return;
    }

    const card = document.querySelector<HTMLElement>("[data-layout-card]");
    const inner = document.querySelector<HTMLElement>("[data-layout-inner]");
    const grid = gridElement;

    if (!card && !inner && !grid) {
      return;
    }

    const measure = (element: HTMLElement | null) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    };

    const update = () => {
      setMetrics({
        card: measure(card),
        inner: measure(inner),
        grid: measure(grid),
      });
    };

    const observers = [card, inner, grid]
      .filter((element): element is HTMLElement => Boolean(element))
      .map((element) => {
        const observer = new ResizeObserver(update);
        observer.observe(element);
        return observer;
      });

    window.addEventListener("resize", update);
    update();

    return () => {
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener("resize", update);
    };
  }, [gridElement]);

  const hasMetrics = Object.values(metrics).some((value) => value !== null);
  const widgetStack = useMemo(() => {
    const stack: React.ReactNode[] = [
      <FocusWidget key="focus" />,
      <TimeWidget key="time" />,
      <GreetingWidget key="greet" user={user} />,
      <LineChartWidget key="line" />,
      <SalesReportWidget key="sales" />,
    ];
    return stack.filter(Boolean);
  }, [user, hasAdminAccess]);
  const renderedWidgets = widgetStack;

  if (loading) {
    return <SplashScreen loading={loading} />;
  }

  return (
    <>
      <div
        className="pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]"
      >
        Dashboard
      </div>
      <DashboardLayout title="">
        <div className="relative w-full h-full">
          <div
            className="relative z-10 w-full h-full pt-20"
            style={{ transform: "scale(0.8)", transformOrigin: "top center" }}
          >
            <div className="h-full overflow-y-auto pr-4">
              <div
                ref={setGridElement}
                data-dashboard-grid
                className="dashboard-grid mx-auto max-w-5xl"
              >
                {renderedWidgets}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
