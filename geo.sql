CREATE TABLE `spat` (
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
SELECT ST_Distance(@g1, @g2);
SELECT ST_Latitude(@g1);
SELECT ST_SwapXY(@g1);
