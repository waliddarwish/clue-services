set pages 100
set lines 160
col product_name format a30
col store_name format a30
col value_of_orders format 9,990.00
col total_value format 999,990.00

col jan_value format 999,990.00
col feb_value format 999,990.00
col mar_value format 999,990.00
col apr_value format 999,990.00
col may_value format 999,990.00
col jun_value format 999,990.00
col jul_value format 999,990.00
col aug_value format 999,990.00
col sep_value format 999,990.00
col oct_value format 999,990.00
col nov_value format 999,990.00
col dec_value format 999,990.00


  

  
PROMPT Product rating analysis
/* Find the mean, median, mode, min, & max rating for each product
   Along with the overall grand total 
   Sorts by mean rating descending; with the grand total at the bottom */
with ratings as (
  select grouping_id ( product_name ) grp_id,
         product_name, 
         count(*) number_of_reviews,
         round ( avg ( rating ), 2 ) product_mean_rating,
         median ( rating ) product_median_rating,
         stats_mode ( rating ) product_mode_rating,
         min ( rating ) product_lowest_rating,
         max ( rating ) product_highest_rating
  from   products, json_table (
    product_details, '$.reviews[*]'
    columns (
      rating int path '$.rating'
    )
  )
  group  by rollup ( product_name )
)
  select case grp_id
           when 0 then product_name
           else 'TOTAL'
         end product_name,
         number_of_reviews,
         product_mean_rating,
         product_median_rating,
         product_mode_rating,
         product_lowest_rating,
         product_highest_rating
  from   ratings
  order  by grp_id, product_mean_rating desc;
  
  
PROMPT Most popular products by volume
/* 5 products with the most orders
   With their corresponding revenue rank */
select p.product_name, 
       count(*) number_of_orders,
       sum ( oi.quantity * oi.unit_price ) total_value,
       rank () over ( 
         order by sum ( oi.quantity * oi.unit_price ) desc 
       ) revenue_rank
from   products p
join   order_items oi
on     p.product_id = oi.product_id
group  by p.product_name
order  by count(*) desc
fetch  first 5 rows only;

PROMPT Most popular products by value
/* 5 products with the highest revenue
   With their corresponding order rank */
select p.product_name, 
       count(*) number_of_orders,
       sum ( oi.quantity * oi.unit_price ) total_value,
       rank () over ( 
         order by count(*) desc 
       ) order_count_rank
from   products p
join   order_items oi
on     p.product_id = oi.product_id
group  by p.product_name
order  by sum ( oi.quantity * oi.unit_price ) desc
fetch  first 5 rows only;

PROMPT Daily order count and value
/* Daily order count and value */
with dates as (
  select date'2018-02-03' + level dt 
  from   dual
  connect by level <= 433
), order_totals as (
  select trunc ( o.order_datetime ) order_date,
         count ( distinct o.order_id ) number_of_orders,
         sum ( oi.quantity * oi.unit_price ) value_of_orders
  from   orders o
  join   order_items oi
  on     o.order_id = oi.order_id
  group  by trunc ( o.order_datetime )
)
  select to_char ( dt, 'DD-MON-YYYY' ) sale_date, 
         nvl ( number_of_orders, 0 ) number_of_orders, 
         nvl ( value_of_orders, 0 ) value_of_orders
  from   dates
  left   join order_totals
  on     dt = order_date
  order  by dt;
  
PROMPT Month and year sales matrix
/* Month and year pivot table of sales 
   Groups the total sales value by month & year
   The uses pivot to get years as rows and months and columns */
with order_totals as (
  select extract ( year from o.order_datetime ) order_year,
         to_char ( o.order_datetime, 'MON', 'NLS_DATE_LANGUAGE = english' ) order_month,
         sum ( oi.quantity * oi.unit_price ) value_of_orders
  from   orders o
  join   order_items oi
  on     o.order_id = oi.order_id
  group  by extract ( year from o.order_datetime ),
         to_char ( o.order_datetime, 'MON', 'NLS_DATE_LANGUAGE = english' )
)
  select * from order_totals
  pivot (
    sum ( value_of_orders ) value
    for order_month in (
      'JAN' JAN, 'FEB' FEB, 'MAR' MAR, 'APR' APR, 'MAY' MAY, 'JUN' JUN,
      'JUL' JUL, 'AUG' AUG, 'SEP' SEP, 'OCT' OCT, 'NOV' NOV, 'DEC' DEC
    )
  )
  order by order_year;