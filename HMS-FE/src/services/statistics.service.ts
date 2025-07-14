import instance from "../api/mainRequest";

type PeriodType = "daily" | "weekly" | "monthly" | "yearly";
const BASE_URL = "/api/v1/statistics"

export const getPeriodStatistics = async (time: PeriodType) => {
    return instance.get(`${BASE_URL}/period-statistics`, {
        params: { time },
    });
};

export const getTopDoctors = async () => {
    return instance.get(`${BASE_URL}/top-doctors`);
};


export const getRevenuePerDayInMonth = async (year: number, month: number) => {
    return instance.get(`${BASE_URL}/revenue-days`, {
        params: { year, month },
    });
};

export const getRevenuePerMonthInYear = async (year: number) => {
    return instance.get(`${BASE_URL}/revenue-months`, {
        params: { year },
    });
};
