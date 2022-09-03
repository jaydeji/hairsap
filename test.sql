-- bookings before week

SELECT
    u.userId,
    b.proId,
    b.bookingId
from User u
    LEFT JOIN Booking b ON b.userId = u.userId
WHERE
    u.role = 'USER'
    AND b.bookingId is NULL -- WHERE b.status = 'COMPLETED';
;

SELECT
    b.userId,
    b.proId,
    COUNT(b.userId) cnt
from User u
    JOIN Booking b ON b.userId = u.userId
WHERE
    b.status = 'COMPLETED'
    AND b.createdAt > '2022-08-26 08:11:03.916'
GROUP BY b.userId, b.proId
HAVING cnt = 2;

SELECT
    b.userId,
    b.proId,
    COUNT(b.userId) cnt
from User u
    JOIN Booking b ON b.userId = u.userId
WHERE
    b.status = 'COMPLETED'
    AND b.createdAt > '2022-07-28 12:51:42.815'
GROUP BY b.userId, b.proId
HAVING cnt < 2;

HAVING COUNT(b.userId) > 1;

SELECT COUNT(b.bookingId) cnt
from User u
    JOIN Booking b ON b.userId = u.userId
WHERE b.status = 'COMPLETED'
HAVING cnt > 0;

SELECT
    ss.serviceId,
    COUNT(ss.serviceId)
from Booking b
    JOIN `BookingSubService` bss ON b.bookingId = bss.bookingId
    JOIN `SubService` ss ON bss.subServiceId = ss.subServiceId
WHERE
    status = "COMPLETED"
    AND b.createdAt >= '2022-09-01 08:11:03.916'
GROUP BY ss.serviceId;

-- new

SELECT
    b.bookingId,
    b.userId,
    b.createdAt,
    COUNT(b.userId)
from Booking b
WHERE status = "COMPLETED";

-- returned

SELECT
    b.bookingId,
    COUNT(b.userId) cnt
from Booking b
WHERE
    status = "COMPLETED"
    AND b.createdAt >= '2022-09-01 08:11:03.916'
GROUP BY
    b.userId,
    b.bookingId
HAVING cnt > 1;

SELECT
    ss.serviceId,
    COUNT(ss.serviceId) serviceIdCnt
FROM (
        SELECT
            userId,
            COUNT(userId) cnt
        FROM booking
        GROUP BY userId
        HAVING cnt = 1
    ) _b
    JOIN booking b on _b.userId = b.userId
    JOIN `BookingSubService` bss ON b.bookingId = bss.bookingId
    JOIN `SubService` ss ON bss.subServiceId = ss.subServiceId
where
    b.createdAt >= '2022-09-01 08:11:03.916'
    AND b.status = "COMPLETED"
GROUP BY ss.serviceId;

-- returned

SELECT
    ss.serviceId,
    s.name,
    COUNT(ss.serviceId) serviceIdCnt
FROM (
        SELECT
            userId,
            COUNT(userId) cnt
        FROM booking
        GROUP BY userId
        HAVING cnt > 1
    ) _b
    JOIN booking b on _b.userId = b.userId
    JOIN `BookingSubService` bss ON b.bookingId = bss.bookingId
    JOIN `SubService` ss ON bss.subServiceId = ss.subServiceId
    JOIN Service s ON ss.serviceId = s.serviceId
where
    b.createdAt >= '2022-09-01 08:11:03.916'
    AND b.status = "COMPLETED"
GROUP BY ss.serviceId;