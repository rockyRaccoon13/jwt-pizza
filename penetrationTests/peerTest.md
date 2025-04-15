## Self attacks:
  ### Tony attacking self:
    Date: 4/15/2025
    
    Classification: Path Traversal
    
    Severity: 9
    
    Description: Can navigate to the create franchise or create store pages without being logged in by using the correct 
    URL.  However, without an authtoken, the requests to create a store or franchise get denied.
    
    Images: 
    
![createFranchise.png](https://github.com/BlueBomber49/jwt-pizza/blob/main/penetrationTests/createFranchise.png)

![createStore.png](https://github.com/BlueBomber49/jwt-pizza/blob/main/penetrationTests/createStore.png)  

    Fix: Check for the correct level of authorization on those pages

  ### Benson Self Attack

    Date: 4/15/2025
    
    Classification: Injection
    
    Severity: 9 (on success)
    
    Description: I attempted to upgrade a registered user's role from diner to admin via the updateUserRole endpoint. This endpoint calls DB.updateUser, which does not use parameterized SQL statements so I attempted to inject a statement. 
    In the end I was able to get a statement injected into the query, however, it would not the sql2 module does not allow multiple statements in one query. 

    Fix: Parameterize all Sql queries
      
  #### sample output query after injection 
  ```sh 
  "UPDATE user SET password='$$$hash', email='hacker@jwt.com' WHERE id=533; UPDATE userRole SET role = 'admin' WHERE id=533"
  ````


    
    
    
## Peer attacks:
  ### Tony attacking Benson:
  
    Date: 4/15/2025
    
    Classification: Injection
    
    Severity: 7
    
    Description: Can update columns outside of the intended columns in the updateUser function.  
    However, as SQL prevents primary key (User ID) from being updated, this is not very severe.
    
    This is the SQL query as it arrived to the database: 
    UPDATE user SET password='hashedPassword', email='hacker@jwt.com', id = '1' WHERE id=5911
    
    Image: 
![SQL_injection.png](https://github.com/BlueBomber49/jwt-pizza/blob/main/penetrationTests/SQL_injection.png) 

    Fix: Sanitize user inputs

  ### Benson attacking Tony:

    Date: 4/15/2025
    
    Classification: Injection
    
    Severity: 9 (on success)
    
    Description: Again I attempted with Tony to try and perform a sql injection. However, I was unsuccessful. 
    Below is my attempted attack script.

    Fix: Parameterize all Sql queries

[Benson's Attack Script](https://github.com/rockyRaccoon13/jwt-pizza/blob/main/penetrationTests/updateRoleSQLAttack.sh)
    
