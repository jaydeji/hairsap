SELECT
    p.promoId,
    code,
    m.name marketerName,
    d.name discountName,
    COUNT(i.promoId) bookingCnt,
    CAST(
        SUM(
            CASE b.status
                WHEN 'completed' THEN 1
                ELSE 0
            END
        ) as INT
    ) completedBookingCnt
FROM `Promo` p
    JOIN Marketer m ON p.marketerId = m.marketerId
    JOIN Discount d ON p.discountId = d.discountId
    JOIN `Invoice` i ON i.promoId = p.promoId
    JOIN `Booking` b ON b.bookingId = i.bookingId
GROUP BY p.promoId;

SELECT
    p.promoId,
    code,
    m.name marketerName,
    d.name discountName,
    COUNT(i.promoId) bookingCnt,
    SUM(
        CASE b.status
            WHEN 'completed' THEN 1
            ELSE 0
        END
    ) completedBookingCnt
FROM `Promo` p
    JOIN Marketer m ON p.marketerId = m.marketerId
    JOIN Discount d ON p.discountId = d.discountId
    JOIN `Invoice` i ON i.promoId = p.promoId
    JOIN `Booking` b ON b.bookingId = i.bookingId
GROUP BY p.promoId;