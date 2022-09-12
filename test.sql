SELECT COUNT(DISTINCT b.userId)
FROM (
        SELECT
            userId,
            COUNT(userId) cnt
        FROM `Booking` b
        WHERE
            b.status = 'completed'
            and proId = 3
        GROUP BY userId
        HAVING cnt > 1
    ) _b
    JOIN booking b on _b.userId = b.userId
WHERE b.createdAt >= '2021-01-01'