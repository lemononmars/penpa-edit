-- WSC 2026 instructions booklet v2: team rounds and stable booklet references.
alter table public.wsc2026_booklet_entries alter column points drop not null;
update public.wsc2026_rounds set name='Gandhari''s Solidarity', minutes=40, points=1200, booklet_available=true where id=8;
update public.wsc2026_rounds set name='Draupadi''s Swayamvara', minutes=25, points=800, booklet_available=true where id=9;
update public.wsc2026_rounds set name='Daanveer Karna', minutes=40, points=1600, booklet_available=true where id=13;
update public.wsc2026_rounds set name='The Game of Dice', minutes=45, points=1800, booklet_available=true where id=14;
update public.wsc2026_rounds set name='Chakravyuha', minutes=35, points=1200, booklet_available=true where id=15;
insert into public.wsc2026_booklet_entries (id,round_id,name,variant_id,points) values
('r08-01',8,'Pips Sudoku','pips',1200),
('r09-01',9,'Flower Sudoku','flower',175),
('r09-02',9,'Perfect Squares Pentagram Sudoku','perfectsquares',125),
('r09-03',9,'Arithmetic Pairs Pentagram Sudoku','arithmetic',125),
('r09-04',9,'Division Pentagram Sudoku','division',125),
('r09-05',9,'Product Killer Pentagram Sudoku','productkiller',125),
('r09-06',9,'Killer Pentagram Sudoku','killer',125),
('r13-01',13,'Classic Sudoku','classic',null),
('r13-02',13,'Battenburg Sudoku','battenburg',null),
('r13-03',13,'Diagonally Consecutive Sudoku','diagonallyconsecutive',null),
('r13-04',13,'Equal Sums Sudoku','equalsums',null),
('r13-05',13,'Perfect Squares Sudoku','perfectsquares',null),
('r13-06',13,'Rossini Sudoku','rossini',null),
('r13-07',13,'Repeated Neighbours Sudoku','repeatedneighbors',null),
('r13-08',13,'XV Sudoku','xv',null),
('r14-01',14,'Classic Sudoku','classic',null),
('r14-02',14,'Exclusion Sudoku','exclusion',null),
('r14-03',14,'Non Consecutive On Line Sudoku','nonconsecutiveonline',null),
('r14-04',14,'Weighted Killer Sudoku','weightedkiller',null),
('r14-05',14,'Consecutive Pairs Sudoku','consecutivepairs',null),
('r14-06',14,'Renban Sudoku','renbanline',null),
('r14-07',14,'Slot Machine Sudoku','slotmachine',null),
('r14-08',14,'Odd Sum Pairs Sudoku','oddsumpairs',null),
('r14-09',14,'Multi Diagonal Sudoku','multidiagonal',null),
('r14-10',14,'258 Sudoku','258',null),
('r14-11',14,'Differences Sudoku','differences',null),
('r14-12',14,'Entropic Lines Sudoku','entropiclines',null),
('r14-13',14,'Missing Thermo Sudoku','missingthermo',null),
('r15-01',15,'Shifted Sudoku','shifted',150),
('r15-02',15,'Inside Skyscraper Sudoku','insideskyscraper',125),
('r15-03',15,'Pointing Digits Sudoku','pointingdigits',125),
('r15-04',15,'Sum Detector Sudoku','sumdetector',125),
('r15-05',15,'Point to Next Sudoku','pointtonext',125),
('r15-06',15,'Search 9 Sudoku','search9',125),
('r15-07',15,'3 Up Sudoku','threeup',125) on conflict (id) do update set round_id=excluded.round_id, name=excluded.name, variant_id=excluded.variant_id, points=excluded.points;
