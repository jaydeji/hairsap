select
    u.userId proId,
    IFNULL(retPros.cnt, 0) retCnt,
    IFNULL(newPros.cnt, 0) newCnt
FROM (
        SELECT
            b.proId,
            COUNT(b.proId) cnt
        FROM (
                -- get returned user bookings
                SELECT
                    userId,
                    COUNT(userId) cnt
                FROM
                    booking
                WHERE
                    status = 'completed'
                GROUP BY
                    userId
                HAVING
                    cnt > 1
            ) _b
            JOIN booking b on _b.userId = b.userId
            JOIN `Invoice` i on b.bookingId = i.bookingId
            JOIN `InvoiceFees` ifees on i.invoiceId = ifees.invoiceId
        WHERE
            b.createdAt >= '2022-06-26 08:11:03.916'
        GROUP BY
            b.proId
    ) retPros
    RIGHT JOIN `User` u on retPros.proId = u.userId
    LEFT JOIN `Booking` b on b.proId = u.userId
    LEFT JOIN `Invoice` i on b.bookingId = i.bookingId
    LEFT JOIN `InvoiceFees` ifees on ifees.invoiceId = i.invoiceId
    LEFT JOIN (
        SELECT
            b.proId,
            COUNT(b.proId) cnt
        FROM (
                -- get new user bookings
                SELECT
                    userId,
                    COUNT(userId) cnt
                FROM
                    booking
                WHERE
                    status = 'completed'
                GROUP BY
                    userId
                HAVING
                    cnt = 1
            ) _b
            JOIN booking b on _b.userId = b.userId
            JOIN `Invoice` i on b.bookingId = i.bookingId
            JOIN `InvoiceFees` ifees on i.invoiceId = ifees.invoiceId
        WHERE
            b.createdAt >= '2022-06-26 08:11:03.916'
        GROUP BY
            b.proId
    ) newPros on newPros.proId = u.userId
WHERE
    u.role = 'pro'
    AND b.status = 'completed'
GROUP BY u.userId
HAVING
    SUM(ifees.price) >= 12