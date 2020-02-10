/*
 _   _             _         _        
| | | |           | |       | |       
| | | | _ __    __| |  __ _ | |_  ___ 
| | | || '_ \  / _` | / _` || __|/ _ \
| |_| || |_) || (_| || (_| || |_|  __/
 \___/ | .__/  \__,_| \__,_| \__|\___|
       | |                            
       |_|                            
*/

INSERT INTO c_betplace (bet_place, gamecode_id) VALUES('zero1', 5),('zero2', 5),('zero3', 5);
	
/*
______        _  _  _                   _    
| ___ \      | || || |                 | |   
| |_/ / ___  | || || |__    __ _   ___ | | __
|    / / _ \ | || || '_ \  / _` | / __|| |/ /
| |\ \| (_) || || || |_) || (_| || (__ |   < 
\_| \_|\___/ |_||_||_.__/  \__,_| \___||_|\_\
UNCOMMENT THE QUERY BELOW AND COMMENT-OUT THE QUERY ABOVE
*/
-- DELETE FROM c_betplace WHERE bet_place IN ('zero1', 'zero2', 'zero3'); 