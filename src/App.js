import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './index.css';

const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(7);
  const [time, setTime] = useState(20);
  const [compound, setCompound] = useState(1);
  const [contribution, setContribution] = useState(100);
  const [contributionFrequency, setContributionFrequency] = useState(12);
  const [result, setResult] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [yAxisTicks, setYAxisTicks] = useState([]);

  const calculateCompoundInterest = () => {
    const newGraphData = [];
    let totalContributions = 0;
    let currentPrincipal = principal;
    let totalInterest = 0;

    for (let year = 0; year <= time; year++) {
      let yearlyContribution = contribution * contributionFrequency;
      let yearlyInterest = 0;
      let startingBalance = currentPrincipal;
      
      for (let period = 0; period < compound; period++) {
        const periodRate = (rate / 100) / compound;
        const periodContribution = yearlyContribution / compound;
        
        yearlyInterest += (currentPrincipal + periodContribution) * periodRate;
        currentPrincipal += periodContribution + ((currentPrincipal + periodContribution) * periodRate);
      }

      totalContributions += yearlyContribution;
      totalInterest += yearlyInterest;
      
      newGraphData.push({
        year,
        principal: Math.round(principal),
        interest: Math.round(totalInterest),
        contributions: Math.round(totalContributions),
        total: Math.round(currentPrincipal),
        yearlyInterest: Math.round(yearlyInterest),
        yearlyContribution: Math.round(yearlyContribution),
        startingBalance: Math.round(startingBalance)
      });
    }

    setGraphData(newGraphData);
    setResult(Math.round(currentPrincipal));

    // Calculate y-axis ticks
    const maxValue = Math.max(...newGraphData.map(d => d.total));
    const ticks = calculateYAxisTicks(maxValue);
    setYAxisTicks(ticks);
  };

  const calculateYAxisTicks = (maxValue) => {
    const tickCount = 5;
    const roughStep = maxValue / (tickCount - 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const step = Math.ceil(roughStep / magnitude) * magnitude;
    return Array.from({length: tickCount}, (_, i) => i * step);
  };

  useEffect(() => {
    calculateCompoundInterest();
  }, [principal, rate, time, compound, contribution, contributionFrequency]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatLargeNumber = (value) => {
    if (value >= 1e6) {
      return '$' + (value / 1e6).toFixed(1) + 'M';
    } else if (value >= 1e3) {
      return '$' + (value / 1e3).toFixed(1) + 'K';
    }
    return '$' + value.toString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow">
          <p className="font-semibold">Year {label}</p>
          <p>Initial Principal: {formatCurrency(payload[0].payload.principal)}</p>
          <p>Total Contributions: {formatCurrency(payload[0].payload.contributions)}</p>
          <p>Total Interest: {formatCurrency(payload[0].payload.interest)}</p>
          <p>Total Amount: {formatCurrency(payload[0].payload.total)}</p>
        </div>
      );
    }
    return null;
  };

  const handleNumberInput = (setValue, allowDecimals = false) => (e) => {
    let value = e.target.value;
    
    // Remove any leading zeros
    value = value.replace(/^0+/, '');
    
    // If the value is empty after removing zeros, set it to '0'
    if (value === '') {
      value = '0';
    }
    
    // For decimal inputs, ensure there's a leading zero if the input starts with a decimal point
    if (allowDecimals && value.startsWith('.')) {
      value = '0' + value;
    }
    
    // Parse the value and update state only if it's a valid number
    const parsedValue = allowDecimals ? parseFloat(value) : parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      setValue(parsedValue);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div className="flex items-center justify-center">
          <Calculator className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-semibold text-gray-800 ml-2">Compound Interest Calculator</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="principal">
                Initial Principal Amount ($)
              </label>
              <input
                id="principal"
                type="text"
                inputMode="numeric"
                value={principal}
                onChange={handleNumberInput(setPrincipal)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rate">
                Annual Interest Rate (%)
              </label>
              <input
                id="rate"
                type="text"
                inputMode="decimal"
                value={rate}
                onChange={handleNumberInput(setRate, true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="time">
                Time Period (years)
              </label>
              <input
                id="time"
                type="text"
                inputMode="numeric"
                value={time}
                onChange={handleNumberInput(setTime)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="compound">
                Compound Frequency (per year)
              </label>
              <select
                id="compound"
                value={compound}
                onChange={(e) => setCompound(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Annually</option>
                <option value="2">Semi-Annually</option>
                <option value="4">Quarterly</option>
                <option value="12">Monthly</option>
                <option value="365">Daily</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contribution">
                Recurring Contribution Amount ($)
              </label>
              <input
                id="contribution"
                type="text"
                inputMode="numeric"
                value={contribution}
                onChange={handleNumberInput(setContribution)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contributionFrequency">
                Contribution Frequency (per year)
              </label>
              <select
                id="contributionFrequency"
                value={contributionFrequency}
                onChange={(e) => setContributionFrequency(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Annually</option>
                <option value="2">Semi-Annually</option>
                <option value="4">Quarterly</option>
                <option value="12">Monthly</option>
                <option value="52">Weekly</option>
              </select>
            </div>
          </div>
        </div>
        
        {result > 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <p className="text-lg font-semibold text-gray-800">
              Final Amount: {formatCurrency(result)}
            </p>
            <p className="text-sm text-gray-600">
              Total Contributions: {formatCurrency(graphData[graphData.length - 1].contributions)}
            </p>
            <p className="text-sm text-gray-600">
              Total Interest Earned: {formatCurrency(graphData[graphData.length - 1].interest)}
            </p>
          </div>
        )}
        
        <div className="mt-8 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graphData}>
              <XAxis dataKey="year" />
              <YAxis
                tickFormatter={(value) => formatLargeNumber(value)}
                domain={[0, 'dataMax']}
                ticks={yAxisTicks}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="principal" stackId="a" fill="#0088FE" name="Initial Principal" />
              <Bar dataKey="contributions" stackId="a" fill="#FFBB28" name="Contributions" />
              <Bar dataKey="interest" stackId="a" fill="#00C49F" name="Interest" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Starting Balance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yearly Contribution</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yearly Interest</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Interest</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {graphData.map((data, index) => (
                <tr key={data.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(data.startingBalance)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(data.yearlyContribution)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(data.yearlyInterest)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(data.interest)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(data.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompoundInterestCalculator;