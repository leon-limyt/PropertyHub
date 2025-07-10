import { useState, useEffect } from "react";
import { Calculator, Home, DollarSign, TrendingUp, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MortgageCalculatorProps {
  propertyPrice: number;
  className?: string;
}

interface CalculationResult {
  maxLoanAmount: number;
  downPayment: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  ltv: number;
  tdsr: number;
  msr: number;
  isEligible: boolean;
  warnings: string[];
  propertyCount: number;
}

export default function MortgageCalculator({ propertyPrice, className = "" }: MortgageCalculatorProps) {
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [existingDebt, setExistingDebt] = useState<string>("");
  const [propertyCount, setPropertyCount] = useState<string>("1");
  const [propertyType, setPropertyType] = useState<string>("private");
  const [loanTenure, setLoanTenure] = useState<string>("25");
  const [interestRate, setInterestRate] = useState<string>("3.5");
  const [borrowerAge, setBorrowerAge] = useState<string>("35");
  const [variableIncome, setVariableIncome] = useState<string>("");
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Auto-update loan tenure when borrower age changes
  useEffect(() => {
    const age = parseInt(borrowerAge);
    if (age > 0) {
      // Maximum loan tenure is typically 65 - current age, capped at 35 years
      const maxTenure = Math.min(65 - age, 35);
      const suggestedTenure = Math.max(Math.min(maxTenure, 30), 15); // Keep between 15-30 years typically
      
      // Only update if current tenure would exceed the maximum allowed
      const currentTenure = parseInt(loanTenure);
      if (currentTenure > maxTenure) {
        setLoanTenure(suggestedTenure.toString());
      }
    }
  }, [borrowerAge]);

  // MAS Guidelines Constants
  const TDSR_LIMIT = 55; // 55%
  const MSR_LIMIT = 30; // 30% for HDB/EC
  const STRESS_TEST_RATE = 4.0; // 4% floor rate
  const VARIABLE_INCOME_HAIRCUT = 0.3; // 30% haircut

  const getLtvLimit = (propertyCount: number, loanTenure: number, age: number): number => {
    const isExtended = loanTenure > 30 || age > 65;
    
    if (propertyCount === 1) {
      return isExtended ? 45 : 75;
    } else if (propertyCount === 2) {
      return isExtended ? 25 : 45;
    } else {
      return isExtended ? 15 : 35;
    }
  };

  const calculateMortgage = (): CalculationResult => {
    const income = parseFloat(monthlyIncome) || 0;
    const debt = parseFloat(existingDebt) || 0;
    const variableIncomeAmount = parseFloat(variableIncome) || 0;
    const tenure = parseInt(loanTenure);
    const rate = parseFloat(interestRate) / 100 / 12;
    const stressRate = STRESS_TEST_RATE / 100 / 12;
    const age = parseInt(borrowerAge);
    const propCount = parseInt(propertyCount);

    // Validate inputs
    if (income <= 0 || tenure <= 0 || age <= 0) {
      return {
        maxLoanAmount: 0,
        downPayment: propertyPrice,
        monthlyPayment: 0,
        totalInterest: 0,
        totalPayment: 0,
        ltv: 0,
        tdsr: 0,
        msr: 0,
        isEligible: false,
        warnings: ["Please provide valid income, age, and loan tenure"],
        propertyCount: propCount
      };
    }

    // Calculate adjusted income (apply haircut to variable income)
    const adjustedVariableIncome = variableIncomeAmount * (1 - VARIABLE_INCOME_HAIRCUT);
    const totalAdjustedIncome = income + adjustedVariableIncome;

    // Get LTV limit based on property count and conditions
    const ltvLimit = getLtvLimit(propCount, tenure, age);
    
    // Calculate maximum loan based on LTV
    const maxLoanByLtv = propertyPrice * (ltvLimit / 100);
    
    // Calculate maximum loan based on TDSR
    const maxTotalDebtService = totalAdjustedIncome * (TDSR_LIMIT / 100);
    const availableForMortgage = Math.max(0, maxTotalDebtService - debt);
    
    // Use stress test rate for affordability calculation
    let maxLoanByTdsr = 0;
    if (availableForMortgage > 0 && stressRate > 0) {
      const monthlyPaymentCapacity = availableForMortgage;
      const denominator = (stressRate * Math.pow(1 + stressRate, tenure * 12)) / (Math.pow(1 + stressRate, tenure * 12) - 1);
      maxLoanByTdsr = monthlyPaymentCapacity / denominator;
    }
    
    // Calculate maximum loan based on MSR (for HDB/EC only)
    let maxLoanByMsr = Infinity;
    if (propertyType === "hdb" || propertyType === "ec") {
      const maxMortgagePayment = totalAdjustedIncome * (MSR_LIMIT / 100);
      if (maxMortgagePayment > 0 && stressRate > 0) {
        const denominator = (stressRate * Math.pow(1 + stressRate, tenure * 12)) / (Math.pow(1 + stressRate, tenure * 12) - 1);
        maxLoanByMsr = maxMortgagePayment / denominator;
      }
    }
    
    // Final loan amount is the minimum of all constraints
    const maxLoanAmount = Math.min(maxLoanByLtv, maxLoanByTdsr, maxLoanByMsr);
    const actualLoanAmount = Math.max(0, Math.min(maxLoanAmount, propertyPrice));
    const downPayment = Math.max(0, propertyPrice - actualLoanAmount);
    
    // Calculate monthly payment using actual interest rate (not stress test rate)
    let monthlyPayment = 0;
    if (actualLoanAmount > 0 && rate > 0) {
      monthlyPayment = actualLoanAmount * (rate * Math.pow(1 + rate, tenure * 12)) / (Math.pow(1 + rate, tenure * 12) - 1);
    }
    
    const totalPayment = monthlyPayment * tenure * 12;
    const totalInterest = totalPayment - actualLoanAmount;
    
    // Calculate actual ratios
    const ltv = actualLoanAmount > 0 ? (actualLoanAmount / propertyPrice) * 100 : 0;
    const tdsr = totalAdjustedIncome > 0 ? ((monthlyPayment + debt) / totalAdjustedIncome) * 100 : 0;
    const msr = totalAdjustedIncome > 0 ? (monthlyPayment / totalAdjustedIncome) * 100 : 0;
    
    // Check eligibility and generate warnings
    const warnings: string[] = [];
    let isEligible = true;
    
    // Check minimum income
    if (totalAdjustedIncome < 3000) {
      warnings.push("Minimum income requirement may not be met (SGD 3,000)");
      isEligible = false;
    }
    
    // Check if borrower can afford the property
    if (availableForMortgage <= 0) {
      warnings.push("Existing debt exceeds TDSR capacity");
      isEligible = false;
    }
    
    // Check TDSR compliance
    if (tdsr > TDSR_LIMIT) {
      warnings.push(`TDSR (${tdsr.toFixed(1)}%) exceeds limit of ${TDSR_LIMIT}%`);
      isEligible = false;
    }
    
    // Check MSR compliance for HDB/EC
    if ((propertyType === "hdb" || propertyType === "ec") && msr > MSR_LIMIT) {
      warnings.push(`MSR (${msr.toFixed(1)}%) exceeds limit of ${MSR_LIMIT}% for HDB/EC`);
      isEligible = false;
    }
    
    // Check LTV compliance
    if (ltv > ltvLimit) {
      warnings.push(`LTV (${ltv.toFixed(1)}%) exceeds limit of ${ltvLimit}% for ${propCount}${propCount === 1 ? 'st' : propCount === 2 ? 'nd' : 'rd'} property`);
      isEligible = false;
    }
    
    // Check loan coverage
    if (actualLoanAmount < propertyPrice * 0.1) {
      warnings.push("Loan amount too low - insufficient borrowing capacity");
      isEligible = false;
    }
    
    // Age and tenure warnings
    if (age + tenure > 65) {
      warnings.push("Loan may extend beyond typical retirement age (65)");
    }
    
    if (tenure > 30 || age > 65) {
      warnings.push("Extended loan tenure or age may result in lower LTV limits");
    }

    return {
      maxLoanAmount: actualLoanAmount,
      downPayment,
      monthlyPayment,
      totalInterest,
      totalPayment,
      ltv,
      tdsr,
      msr,
      isEligible,
      warnings,
      propertyCount: propCount
    };
  };

  useEffect(() => {
    if (monthlyIncome) {
      setResult(calculateMortgage());
    }
  }, [monthlyIncome, existingDebt, propertyCount, propertyType, loanTenure, interestRate, borrowerAge, variableIncome]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Mortgage Calculator
            <Badge variant="outline" className="ml-2">MAS Compliant</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Property Price</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(propertyPrice)}</div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income (SGD) *</Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="e.g., 8000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="variableIncome">Variable Income (SGD)</Label>
              <Input
                id="variableIncome"
                type="number"
                placeholder="e.g., 2000"
                value={variableIncome}
                onChange={(e) => setVariableIncome(e.target.value)}
              />
              <div className="text-xs text-gray-500">Bonus, commission, allowances (30% haircut applies)</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="existingDebt">Existing Monthly Debt (SGD)</Label>
              <Input
                id="existingDebt"
                type="number"
                placeholder="e.g., 1000"
                value={existingDebt}
                onChange={(e) => setExistingDebt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="borrowerAge">Borrower Age</Label>
              <Input
                id="borrowerAge"
                type="number"
                placeholder="e.g., 35"
                value={borrowerAge}
                onChange={(e) => setBorrowerAge(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyCount">Property Count</Label>
              <Select value={propertyCount} onValueChange={setPropertyCount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Property</SelectItem>
                  <SelectItem value="2">2nd Property</SelectItem>
                  <SelectItem value="3">3rd+ Property</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private Property</SelectItem>
                  <SelectItem value="hdb">HDB Flat</SelectItem>
                  <SelectItem value="ec">Executive Condo (EC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanTenure">Loan Tenure (Years)</Label>
              <Select value={loanTenure} onValueChange={setLoanTenure}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan tenure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 years</SelectItem>
                  <SelectItem value="20">20 years</SelectItem>
                  <SelectItem value="25">25 years</SelectItem>
                  <SelectItem value="30">30 years</SelectItem>
                  <SelectItem value="35">35 years</SelectItem>
                </SelectContent>
              </Select>
              {borrowerAge && (
                <div className="text-xs text-gray-500">
                  Max tenure for age {borrowerAge}: {Math.min(65 - parseInt(borrowerAge), 35)} years
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                placeholder="e.g., 3.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <Separator />
              
              {/* Eligibility Status */}
              <div className={`p-4 rounded-lg ${result.isEligible ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2">
                  {result.isEligible ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${result.isEligible ? 'text-green-800' : 'text-red-800'}`}>
                    {result.isEligible ? 'Loan Eligible' : 'Loan Not Eligible'}
                  </span>
                </div>
                
                {result.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-red-700 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Loan Amount</div>
                  <div className="text-2xl font-bold">{formatCurrency(result.maxLoanAmount)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Down Payment</div>
                  <div className="text-2xl font-bold">{formatCurrency(result.downPayment)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Monthly Payment</div>
                  <div className="text-2xl font-bold">{formatCurrency(result.monthlyPayment)}</div>
                </div>
              </div>

              {/* MAS Ratios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">LTV Ratio</div>
                  <div className="text-xl font-bold text-blue-700">{result.ltv.toFixed(1)}%</div>
                  <div className="text-xs text-blue-600">
                    Limit: {getLtvLimit(result.propertyCount, parseInt(loanTenure), parseInt(borrowerAge))}%
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 mb-1">TDSR</div>
                  <div className="text-xl font-bold text-purple-700">{result.tdsr.toFixed(1)}%</div>
                  <div className="text-xs text-purple-600">Limit: {TDSR_LIMIT}%</div>
                </div>
                {(propertyType === "hdb" || propertyType === "ec") && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 mb-1">MSR</div>
                    <div className="text-xl font-bold text-orange-700">{result.msr.toFixed(1)}%</div>
                    <div className="text-xs text-orange-600">Limit: {MSR_LIMIT}%</div>
                  </div>
                )}
              </div>

              {/* Loan Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Loan Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total Interest: {formatCurrency(result.totalInterest)}</div>
                  <div>Total Payment: {formatCurrency(result.totalPayment)}</div>
                  <div>Loan Tenure: {loanTenure} years</div>
                  <div>Interest Rate: {interestRate}%</div>
                </div>
              </div>

              {/* Important Notes */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> This calculator uses MAS guidelines and stress test rate of {STRESS_TEST_RATE}%. 
                  Actual loan approval depends on bank's assessment, credit score, and other factors. 
                  Variable income has a 30% haircut applied as per MAS guidelines.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}