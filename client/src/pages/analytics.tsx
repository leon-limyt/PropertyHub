import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Building, Users, DollarSign, Home, BarChart3, Activity } from "lucide-react";
import type { MarketAnalytics } from "@shared/schema";

export default function Analytics() {
  const { data: analytics, isLoading, error } = useQuery<MarketAnalytics[]>({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics Unavailable</h1>
            <p className="text-gray-600">Failed to load market analytics data.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalUnitsSold = analytics.reduce((sum, item) => sum + item.unitsSold, 0);
  const avgPrice = analytics.reduce((sum, item) => sum + parseFloat(item.averagePrice), 0) / analytics.length;
  const avgPsf = analytics.reduce((sum, item) => sum + parseFloat(item.averagePsf), 0) / analytics.length;
  const avgYoyChange = analytics.reduce((sum, item) => sum + parseFloat(item.yoyChange), 0) / analytics.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <title>Market Analytics - PropertyHub Singapore</title>
      <meta name="description" content="Real-time Singapore property market analytics, price trends, and investment insights. Track district performance and market activity." />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Market Analytics</h1>
          <p className="text-gray-600">Real-time market data and insights for Singapore properties</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(avgPrice / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-teal-600" />
                </div>
              </div>
              <p className={`text-xs ${avgYoyChange >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                {avgYoyChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(avgYoyChange).toFixed(1)}% from last year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average PSF</p>
                  <p className="text-2xl font-bold text-gray-900">${avgPsf.toFixed(0)}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Home className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Current market rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Units Sold</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUnitsSold.toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active trading
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Districts</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.length}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Tracked locations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* District Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                District Price Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.map((item) => (
                  <div key={item.district} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.district}</p>
                      <p className="text-sm text-gray-600">
                        ${parseFloat(item.averagePrice).toLocaleString()} avg price
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-teal-600">
                        ${parseFloat(item.averagePsf).toFixed(0)} psf
                      </p>
                      <p className={`text-sm ${
                        parseFloat(item.yoyChange) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(item.yoyChange) >= 0 ? '+' : ''}
                        {parseFloat(item.yoyChange).toFixed(1)}% YoY
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Market Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.map((item) => (
                  <div key={item.district} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.district}</p>
                      <p className="text-sm text-gray-600">
                        {item.unitsSold} units sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-teal-600">
                        {((item.unitsSold / totalUnitsSold) * 100).toFixed(1)}%
                      </p>
                      <p className={`text-sm ${
                        parseFloat(item.quarterlyChange) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(item.quarterlyChange) >= 0 ? '+' : ''}
                        {parseFloat(item.quarterlyChange).toFixed(1)}% Q/Q
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Top Performing Districts</h4>
                <div className="space-y-2">
                  {analytics
                    .sort((a, b) => parseFloat(b.yoyChange) - parseFloat(a.yoyChange))
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={item.district} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 mr-3">
                            #{index + 1}
                          </span>
                          <span className="text-sm text-gray-900">{item.district}</span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          +{parseFloat(item.yoyChange).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Most Active Districts</h4>
                <div className="space-y-2">
                  {analytics
                    .sort((a, b) => b.unitsSold - a.unitsSold)
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={item.district} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 mr-3">
                            #{index + 1}
                          </span>
                          <span className="text-sm text-gray-900">{item.district}</span>
                        </div>
                        <span className="text-sm font-semibold text-teal-600">
                          {item.unitsSold} units
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
