SELECT *
FROM (
        SELECT
            name,
            SUM(price)
        FROM Booking b
            JOIN `Invoice` i ON b.bookingId = i.bookingId
            JOIN `InvoiceFees` ifees ON i.invoiceId = ifees.invoiceId
        WHERE
            proId = 3
            AND status = 'COMPLETED'
        GROUP BY name
    ) _ifees;

SELECT
    ifees.name,
    SUM(ifees.price)
FROM (
        SELECT b.userId
        FROM Booking b
            JOIN `Invoice` i ON b.bookingId = i.bookingId
            JOIN `InvoiceFees` ifees ON i.invoiceId = ifees.invoiceId
        WHERE
            proId = 3
            AND status = 'COMPLETED'
        GROUP BY b.userId
        HAVING
            COUNT(b.userId) = 1
    ) _b
    JOIN booking b on _b.userId = b.userId
    JOIN `Invoice` i ON b.bookingId = i.bookingId
    JOIN `InvoiceFees` ifees ON i.invoiceId = ifees.invoiceId
WHERE b.createdAt >= ${period}
GROUP BY ifees.name;