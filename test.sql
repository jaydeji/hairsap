SELECT
    u.userId proId,
    IFNULL(_b1.newCnt, 0) cnt
FROM (
        -- get pros associated with new user bookings
        SELECT
            b.proId,
            COUNT(b.proId) newCnt
        FROM (
                -- get new user bookings
                SELECT
                    userId,
                    COUNT(userId) cnt
                FROM booking
                WHERE
                    status = 'completed'
                GROUP BY
                    userId
                HAVING
                    cnt = 1
            ) _b
            JOIN booking b on _b.userId = b.userId -- JOIN `Invoice` i on b.bookingId = i.bookingId
            -- JOIN `InvoiceFees` ifees on i.invoiceId = ifees.invoiceId
        WHERE
            b.createdAt >= '2022-08-26 08:11:03.916'
        GROUP BY b.proId
    ) _b1
    RIGHT JOIN User u on _b1.proId = u.userId
WHERE u.role = 'pro';

SELECT
    b.proId,
    -- SUM(ifees.price),
    -- COUNT(b.proId) newCnt
    i.invoiceId
FROM (
        -- get new user bookings
        SELECT
            userId,
            COUNT(userId) cnt
        FROM booking
        WHERE
            status = 'completed'
        GROUP BY userId
        HAVING cnt > 1
    ) _b
    JOIN booking b on _b.userId = b.userId
    JOIN `Invoice` i on b.bookingId = i.bookingId
    JOIN `InvoiceFees` ifees on i.invoiceId = ifees.invoiceId -- WHERE
    --     b.createdAt >= '2022-08-26 08:11:03.916'
    -- GROUP BY b.proId
;

INSERT INTO
    `User` (
        name,
        email,
        address,
        password,
        verified,
        phone,
        role
    )
VALUES (
        'user1',
        'user1@email.com',
        'address 1',
        'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
        1,
        '000000001',
        'user'
    ), (
        'user2',
        'user2@email.com',
        'address 2',
        'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
        1,
        '000000002',
        'user'
    ), (
        'user3',
        'user3@email.com',
        'address 3',
        'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
        1,
        '000000003',
        'user'
    ), (
        'user4',
        'user4@email.com',
        'address 4',
        'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
        1,
        '000000004',
        'user'
    ), (
        'user5',
        'user5@email.com',
        'address 5',
        'e6f05048fbd74322097eb596700ce2357d9aed2db4b9772dec61f17bd4fa5a95',
        1,
        '000000005',
        'user'
    );