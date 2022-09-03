CREATE TABLE
    `spat` (
        `id` INTEGER NOT NULL AUTO_INCREMENT,
        geom GEOMETRY NOT NULL SRID 4326,
        SPATIAL INDEX(geom),
        PRIMARY KEY (`id`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @g1 = 'POINT(1 1)';

INSERT INTO spat (geom) VALUES (ST_GeomFromText(@g1,4326));

SET @g2 = 'POINT(2 2)';

INSERT INTO spat (geom) VALUES (ST_GeomFromText(@g2,4326));

SELECT ST_AsText(geom) FROM spat;

SELECT ST_AsBinary(geom) FROM spat;

SET @g1 = ST_GeomFromText('POINT(1 1)',4326);

SET @g2 = ST_GeomFromText('POINT(2 2)',4326);

SELECT ST_Latitude(@g1);

SELECT ST_SwapXY(@g1);

CREATE TABLE
    `spat` (
        `id` INTEGER NOT NULL AUTO_INCREMENT,
        geom GEOMETRY NOT NULL,
        SPATIAL INDEX(geom),
        PRIMARY KEY (`id`)
    );

INSERT INTO spat (geom)
VALUES (
        POINT(
            3.372669140201567,
            6.518572387441918
        )
    );

SELECT ST_AsText(geom) from spat;

SELECT (
        6371 * acos(
            cos(radians(6.518572387441918)) * cos(radians(6.520238459241921)) * cos(
                radians(3.3680734868226345) - radians(3.372669140201567)
            ) + sin(radians(6.518572387441918)) * sin(radians(6.520238459241921))
        )
    );

--0.5404526603098428

-- lat lng

-- 544.07m google

-- 6.518572387441918, 3.372669140201567 yabatech

-- 6.520238459241921, 3.3680734868226345 god is good

-- POINT(lng, lat) - no SRID

-- 2. ST_GeomFromText('POINT(lat lng)', 4326) - with SRID

SELECT
    ST_Distance_Sphere(
        POINT(
            3.372669140201567,
            6.518572387441918
        ),
        POINT(
            3.3680734868226345,
            6.520238459241921
        )
    );

--540.4514700198677

select
    st_distance_sphere(
        POINT(-73.9949, 40.7501),
        POINT(-73.9961, 40.7542)
    );

--466.9696023589275

select
    st_distance_sphere(
        ST_GeomFromText(
            'POINT(40.7501 -73.9949)',
            4326
        ),
        ST_GeomFromText(
            'POINT(40.7542 -73.9961)',
            4326
        )
    );

--466.9712714183534

SET
    @g1 = ST_GeomFromText(
        ' POINT(
            6.518572387441918
            3.372669140201567
        )',
        4326
    );

SET
    @g2 = ST_GeomFromText(
        'POINT(
            6.520238459241921
            3.3680734868226345
        )',
        4326
    );

SELECT ST_Distance(@g1, @g2);

--540.6606646428002

SELECT ST_Distance_Sphere(@g1, @g2);

where userId = 3;

--keep

UPDATE User
SET
    location = POINT(
        3.3680734868226345,
        6.520238459241921
    )
where userId = 3;

Update User as u1, (
        SELECT
            u.userId,
            u.deactivationCount,
            u.deactivated,
            u.terminated,
            SUM(ifees.price) _sum,
            COUNT(b.bookingId) _count
        FROM User u
            JOIN Booking b on b.proId = u.userId
            JOIN `Invoice` i on i.bookingId = b.bookingId
            JOIN `InvoiceFees` ifees on ifees.invoiceId = i.invoiceId
        WHERE
            role = 'pro'
            AND deactivated = 0
            AND u.terminated = 0
            AND verified = 1
            AND b.status = "completed"
            AND b.createdAt > '2022-08-28 12:51:42.815'
        GROUP BY u.userId
        HAVING
            _sum < 30000000
            AND _count > 24
    ) as u2
SET
    u1.terminated = IF(
        u2.deactivationCount > 2,
        1,
        u1.terminated
    ),
    u1.deactivated = 1
WHERE u1.userId = u2.userId;