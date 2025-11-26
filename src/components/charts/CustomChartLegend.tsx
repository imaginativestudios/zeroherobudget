import { formatCurrency } from "@/lib/utils";

interface PieLegendItem {
  name: string;
  value: number;
  percentage: string;
  color: string;
}

interface PieLegendProps {
  data: PieLegendItem[];
}

export const CustomPieLegend = ({ data }: PieLegendProps) => {
  return (
    <div className="w-full mt-4">
      <div className="bg-muted/30 border border-border/50 rounded-lg p-4 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2 min-w-0">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex items-baseline gap-2 min-w-0 flex-1">
                <span className="font-medium text-sm text-foreground truncate">
                  {item.name}
                </span>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatCurrency(item.value)}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  ({item.percentage})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface BarLegendItem {
  label: string;
  color: string;
}

interface BarLegendProps {
  items: BarLegendItem[];
}

export const CustomBarLegend = ({ items }: BarLegendProps) => {
  return (
    <div className="flex items-center justify-center gap-6 mb-4 pb-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm shadow-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-medium text-sm text-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
