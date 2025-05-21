import dayjs from "dayjs";

const PASSWORD_DEFAULT = "123456";
const adminAccountDefault = {
    password: PASSWORD_DEFAULT,
    activeStatus: true,
    userType: "admin",
    email: "admin@gmail.com",
    fullName: "Admin",
    gender: "male",
};

const MIN_HOUR_DAY = 8;
const MAX_HOUR_DAY = 16;

const generateTimeSlots = (date) => {
    const timeSlots = [];

    const currentTime = dayjs().add(30, "minute");
    const currentHour = currentTime.hour();
    const currentMinute = currentTime.minute();
    // add 30 minutes to current time

    for (let hour = MIN_HOUR_DAY; hour <= MAX_HOUR_DAY; hour++) {
        if (hour === 12) continue;

        if (dayjs().format("DD/MM/YYYY") === date) {
            if (hour < currentHour) continue;
            if (hour === currentHour) {
                if (currentMinute > 30) {
                    continue;
                } else {
                    timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
                    continue;
                }
            }
        }

        timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
        timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return timeSlots;
};


const FORMAT_DATE_TIME = "DD/MM/YYYY HH:mm";

const TIME_CAN_EDIT = 2;
const TIME_PHYSICAL_EXAM = 30;

const FORMAT_DATE = "DD/MM/YYYY";
const FORMAT_TIME = "HH:mm";

const getToday = () => {
    return dayjs().format(FORMAT_DATE);
};

const formatedDate = (date, format = null) => {
    return dayjs(date, format || FORMAT_DATE).format(format || FORMAT_DATE);
};

const formatedTime = (date) => {
    return dayjs(date, FORMAT_TIME).format(FORMAT_TIME);
};

const formatedDateTimeISO = (date, format = null) => {
    return dayjs(date, format || FORMAT_DATE).toISOString();
};



export {
    generateTimeSlots,
    getToday,
    formatedDate,
    formatedTime,
    TIME_CAN_EDIT,
    TIME_PHYSICAL_EXAM,
    FORMAT_TIME,
    FORMAT_DATE_TIME,
    FORMAT_DATE,
    formatedDateTimeISO,
    adminAccountDefault

};
