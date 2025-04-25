"use client";

import { useState, useEffect } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

// Granularity options
type Granularity = "second" | "minute" | "hour" | "day";

// Constants
const ITEMS_PER_PAGE = 30; // Number of time periods to show per page
const CONTEXT_PADDING = 5; // Number of time periods to add as context on each side

export default function UsageGraph({
	requestCounts,
}: {
	requestCounts: number[];
}) {
	const [granularity, setGranularity] = useState<Granularity>("hour");
	const [chartData, setChartData] = useState<any[]>([]);
	const [maxCount, setMaxCount] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [allGroupedData, setAllGroupedData] = useState<any[]>([]);

	// Process data when timestamps or granularity changes
	useEffect(() => {
		if (!requestCounts || requestCounts.length === 0) {
			setChartData([]);
			setAllGroupedData([]);
			setMaxCount(0);
			setTotalPages(1);
			setCurrentPage(0);
			return;
		}

		// Deduplicate timestamps to prevent double counting
		const uniqueTimestamps = [...new Set(requestCounts)];

		// Sort timestamps ascending
		const sortedTimestamps = [...uniqueTimestamps].sort((a, b) => a - b);

		// Group counts by the selected time granularity
		const groupedData = groupByTimeGranularity(
			sortedTimestamps,
			granularity
		);

		// Add empty data points for continuous time series
		const continuousData = createContinuousTimeSeries(
			groupedData,
			granularity
		);

		setAllGroupedData(continuousData);

		// Calculate total pages needed
		const pages = Math.max(
			1,
			Math.ceil(continuousData.length / ITEMS_PER_PAGE)
		);
		setTotalPages(pages);

		// Reset to first page when granularity changes
		setCurrentPage(0);

		// Update the current page of data
		updateCurrentPageData(continuousData, 0);
	}, [requestCounts, granularity]);

	// Update when page changes
	useEffect(() => {
		updateCurrentPageData(allGroupedData, currentPage);
	}, [currentPage, allGroupedData]);

	// Create a continuous time series by filling in gaps
	const createContinuousTimeSeries = (
		data: any[],
		granularity: Granularity
	) => {
		if (data.length <= 1) return data;

		const result = [];
		const timeUnit = getTimeUnitMilliseconds(granularity);

		// Sort data by timestamp
		const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

		for (let i = 0; i < sortedData.length; i++) {
			result.push(sortedData[i]);

			// If there's a next item and there's a gap, fill it
			if (i < sortedData.length - 1) {
				const current = sortedData[i];
				const next = sortedData[i + 1];
				const expectedNextTime = current.timestamp + timeUnit;

				// If there's a gap (more than one time unit)
				if (next.timestamp - current.timestamp > timeUnit * 1.5) {
					// Add empty data points for the gap
					let timePoint = expectedNextTime;

					// Only add a few points in the middle for large gaps
					const gapSize =
						Math.floor(
							(next.timestamp - current.timestamp) / timeUnit
						) - 1;
					if (gapSize > 10) {
						// Add one point after current
						result.push(
							createEmptyDataPoint(timePoint, granularity)
						);

						// Add one point before next
						result.push(
							createEmptyDataPoint(
								next.timestamp - timeUnit,
								granularity
							)
						);
					} else {
						// Fill in all gaps for smaller gaps
						while (timePoint < next.timestamp - timeUnit / 2) {
							result.push(
								createEmptyDataPoint(timePoint, granularity)
							);
							timePoint += timeUnit;
						}
					}
				}
			}
		}

		return result.sort((a, b) => a.timestamp - b.timestamp);
	};

	// Create an empty data point for a given timestamp
	const createEmptyDataPoint = (
		timestamp: number,
		granularity: Granularity
	) => {
		const date = new Date(timestamp);
		let formattedTime = formatTimeByGranularity(date, granularity);

		return {
			time: formattedTime,
			timestamp: timestamp,
			date: date.toLocaleDateString(),
			count: 0,
			isEmpty: true,
		};
	};

	// Get the milliseconds for a time unit based on granularity
	const getTimeUnitMilliseconds = (granularity: Granularity): number => {
		switch (granularity) {
			case "second":
				return 1000;
			case "minute":
				return 60 * 1000;
			case "hour":
				return 60 * 60 * 1000;
			case "day":
				return 24 * 60 * 60 * 1000;
			default:
				return 60 * 60 * 1000;
		}
	};

	// Format a date based on granularity
	const formatTimeByGranularity = (
		date: Date,
		granularity: Granularity
	): string => {
		switch (granularity) {
			case "second":
				return date.toLocaleTimeString();
			case "minute":
				return date.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				});
			case "hour":
				return date.toLocaleTimeString([], {
					hour: "2-digit",
				});
			case "day":
				return date.toLocaleDateString();
			default:
				return date.toLocaleTimeString([], {
					hour: "2-digit",
				});
		}
	};

	// Update visible data based on pagination
	const updateCurrentPageData = (data: any[], page: number) => {
		if (!data.length) {
			setChartData([]);
			setMaxCount(0);
			return;
		}

		// Get active data for current page
		const start = page * ITEMS_PER_PAGE;
		const end = Math.min(start + ITEMS_PER_PAGE, data.length);

		// Add context padding before and after, but respect data boundaries
		const contextStart = Math.max(0, start - CONTEXT_PADDING);
		const contextEnd = Math.min(data.length, end + CONTEXT_PADDING);

		const visibleData = data.slice(contextStart, contextEnd);

		// Find the maximum count value for y-axis scaling
		const max = Math.max(...visibleData.map((item) => item.count));
		setMaxCount(max);

		setChartData(visibleData);
	};

	// Go to previous page
	const handlePrevPage = () => {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1);
		}
	};

	// Go to next page
	const handleNextPage = () => {
		if (currentPage < totalPages - 1) {
			setCurrentPage(currentPage + 1);
		}
	};

	// Group timestamps by the selected granularity
	const groupByTimeGranularity = (
		timestamps: number[],
		granularity: Granularity
	) => {
		const timeGroups: Record<string, number> = {};

		timestamps.forEach((timestamp) => {
			const date = new Date(timestamp * 1000);
			let timeKey: string;

			switch (granularity) {
				case "second":
					timeKey = `${date.toISOString().slice(0, 19)}`;
					break;
				case "minute":
					timeKey = `${date.toISOString().slice(0, 16)}:00`;
					break;
				case "hour":
					timeKey = `${date.toISOString().slice(0, 13)}:00:00`;
					break;
				case "day":
					timeKey = `${date.toISOString().slice(0, 10)}T00:00:00`;
					break;
				default:
					timeKey = `${date.toISOString().slice(0, 13)}:00:00`;
			}

			if (timeGroups[timeKey]) {
				timeGroups[timeKey]++;
			} else {
				timeGroups[timeKey] = 1;
			}
		});

		// Convert to array for chart
		return Object.entries(timeGroups)
			.map(([timeKey, count]) => {
				const date = new Date(timeKey);
				let formattedTime = formatTimeByGranularity(date, granularity);

				return {
					time: formattedTime,
					timestamp: date.getTime(),
					date: date.toLocaleDateString(),
					count,
					isEmpty: false,
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);
	};

	// Calculate the y-axis domain with padding at the top
	const yAxisDomain = [0, maxCount > 0 ? Math.ceil(maxCount * 1.3) : 10];

	// Get date range for current page
	let dateRangeText = "";
	if (chartData.length > 0 && totalPages > 1) {
		// Find first and last non-empty data points
		const firstDataPoint =
			chartData.find((d) => !d.isEmpty) || chartData[0];
		const lastDataPoint =
			[...chartData].reverse().find((d) => !d.isEmpty) ||
			chartData[chartData.length - 1];

		if (granularity === "day") {
			dateRangeText = `${new Date(
				firstDataPoint.timestamp
			).toLocaleDateString()} - ${new Date(
				lastDataPoint.timestamp
			).toLocaleDateString()}`;
		} else {
			dateRangeText = `${new Date(
				firstDataPoint.timestamp
			).toLocaleString()} - ${new Date(
				lastDataPoint.timestamp
			).toLocaleString()}`;
		}
	}

	// Calculate statistics
	const uniqueTimestamps = [...new Set(requestCounts)];
	const totalRequests = uniqueTimestamps.length;
	const oldestRequest =
		requestCounts.length > 0
			? new Date(Math.min(...uniqueTimestamps) * 1000).toLocaleString()
			: "N/A";
	const newestRequest =
		requestCounts.length > 0
			? new Date(Math.max(...uniqueTimestamps) * 1000).toLocaleString()
			: "N/A";

	return (
		<div className="w-full bg-white/5 rounded-lg p-4 border border-white/10">
			<div className="flex flex-row items-center justify-between pb-2">
				<h3 className="text-md font-medium text-white/85">API Usage</h3>
				<select
					value={granularity}
					onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
						setGranularity(e.target.value as Granularity)
					}
					className="bg-white/10 text-white/85 rounded-md px-2 py-1 text-sm border border-white/20"
				>
					<option value="second">By Second</option>
					<option value="minute">By Minute</option>
					<option value="hour">By Hour</option>
					<option value="day">By Day</option>
				</select>
			</div>
			<div className="grid grid-cols-3 gap-4 mb-4">
				<div>
					<div className="text-sm font-medium text-white/60">
						Total Requests
					</div>
					<div className="text-2xl font-bold text-white/85">
						{totalRequests}
					</div>
				</div>
				<div>
					<div className="text-sm font-medium text-white/60">
						First Request
					</div>
					<div className="text-md text-white/85">{oldestRequest}</div>
				</div>
				<div>
					<div className="text-sm font-medium text-white/60">
						Latest Request
					</div>
					<div className="text-md text-white/85">{newestRequest}</div>
				</div>
			</div>

			{chartData.length > 0 ? (
				<>
					<div className="h-[400px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={chartData}
								margin={{
									top: 15,
									right: 30,
									left: 20,
									bottom: 25,
								}}
								barSize={10} // Set a smaller constant width for bars
							>
								<CartesianGrid
									strokeDasharray="3 3"
									opacity={0.1}
								/>
								<XAxis
									dataKey="time"
									angle={-45}
									textAnchor="end"
									height={60}
									tick={{ fill: "rgba(255, 255, 255, 0.6)" }}
									interval={Math.min(
										2,
										Math.max(
											0,
											Math.floor(chartData.length / 20)
										)
									)} // Adjust label density based on data points
								/>
								<YAxis
									tick={{ fill: "rgba(255, 255, 255, 0.6)" }}
									domain={yAxisDomain}
									allowDataOverflow={false}
								/>
								<Tooltip
									labelFormatter={(value) => `Time: ${value}`}
									formatter={(value, name) => [
										value,
										"Requests",
									]}
									contentStyle={{
										backgroundColor:
											"rgba(15, 23, 42, 0.9)",
										border: "1px solid rgba(255, 255, 255, 0.2)",
										color: "#fff",
									}}
								/>
								<Bar
									dataKey="count"
									name="API Requests"
									fill="#00bba7"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>

					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-4">
							<button
								onClick={handlePrevPage}
								disabled={currentPage === 0}
								className={`px-3 py-1 rounded text-white/85 ${
									currentPage === 0
										? "opacity-50 cursor-not-allowed"
										: "hover:bg-white/10"
								}`}
							>
								← Previous
							</button>

							<div className="text-white/60 text-sm">
								{dateRangeText} (Page {currentPage + 1} of{" "}
								{totalPages})
							</div>

							<button
								onClick={handleNextPage}
								disabled={currentPage === totalPages - 1}
								className={`px-3 py-1 rounded text-white/85 ${
									currentPage === totalPages - 1
										? "opacity-50 cursor-not-allowed"
										: "hover:bg-white/10"
								}`}
							>
								Next →
							</button>
						</div>
					)}
				</>
			) : (
				<div className="h-[300px] flex items-center justify-center">
					<p className="text-white/60">No data available</p>
				</div>
			)}
		</div>
	);
}
