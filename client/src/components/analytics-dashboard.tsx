import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Building, Users, DollarSign, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketAnalytics } from "@shared/schema";

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading, error } = useQuery<MarketAnalytics[]>({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-128 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const totalUnitsSold = analytics.reduce((sum, item) => sum + item.unitsSold, 0);
  const avgPrice = analytics.reduce((sum, item) => sum + parseFloat(item.averagePrice), 0) / analytics.length;
  const avgPsf = analytics.reduce((sum, item) => sum + parseFloat(item.averagePsf), 0) / analytics.length;
  const avgYoyChange = analytics.reduce((sum, item) => sum + parseFloat(item.yoyChange), 0) / analytics.length;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Singapore Property Market Insights</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay informed with real-time market data and trends
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-teal-600" />
              </div>
              <div className="text-3xl font-bold text-teal-600 mb-2">
                ${(avgPrice / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-gray-600 mb-2">Average Condo Price</div>
              <div className={`text-xs font-semibold ${avgYoyChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {avgYoyChange >= 0 ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                {Math.abs(avgYoyChange).toFixed(1)}% YoY
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-teal-600" />
              </div>
              <div className="text-3xl font-bold text-teal-600 mb-2">{analytics.length}</div>
              <div className="text-sm text-gray-600 mb-2">Districts Tracked</div>
              <div className="text-xs text-emerald-600 font-semibold">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Active Market
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Home className="h-8 w-8 text-teal-600" />
              </div>
              <div className="text-3xl font-bold text-teal-600 mb-2">${avgPsf.toFixed(0)}</div>
              <div className="text-sm text-gray-600 mb-2">Average PSF</div>
              <div className="text-xs text-emerald-600 font-semibold">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Market Rate
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-teal-600" />
              </div>
              <div className="text-3xl font-bold text-teal-600 mb-2">{totalUnitsSold.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mb-2">Total Units Sold</div>
              <div className="text-xs text-emerald-600 font-semibold">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Active Trading
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Price Trends by District</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">District Performance</h4>
                <div className="space-y-4">
                  {analytics.map((item) => (
                    <div key={item.district} className="flex items-center justify-between">
                      <span className="text-gray-700">{item.district}</span>
                      <div className="flex items-center">
                        <span className="text-teal-600 font-semibold">
                          ${parseFloat(item.averagePsf).toFixed(0)} psf
                        </span>
                        <span className={`text-sm ml-2 ${
                          parseFloat(item.yoyChange) >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {parseFloat(item.yoyChange) >= 0 ? '+' : ''}
                          {parseFloat(item.yoyChange).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Market Activity</h4>
                <div className="space-y-4">
                  {analytics.map((item) => (
                    <div key={item.district} className="flex items-center justify-between">
                      <span className="text-gray-700">{item.district}</span>
                      <div className="flex items-center">
                        <span className="text-teal-600 font-semibold">
                          {item.unitsSold} units
                        </span>
                        <span className={`text-sm ml-2 ${
                          parseFloat(item.quarterlyChange) >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {parseFloat(item.quarterlyChange) >= 0 ? '+' : ''}
                          {parseFloat(item.quarterlyChange).toFixed(1)}% Q/Q
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
