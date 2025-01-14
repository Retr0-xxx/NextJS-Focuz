import mysql from 'mysql2/promise';

export async function getPlantData(clientId: any) {
    try {
        // Establish database connection
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Execute the query
        const [rows]: any = await db.query(
            `SELECT growth, water, death FROM users WHERE email = ?`, // Ensure the correct column and table names
            [clientId]
        );
        console.log(rows);

        // Close the connection
        await db.end();

        // Return the query result
        return rows[0];
    } catch (error) {
        console.error('Error fetching plant data:', error);
        throw error;
    }
}

export async function setPlantData(clientId: any, growth: number, water: number, death: number) {
    try {
        // Establish database connection
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Execute the query
        const [rows] = await db.query(
            `UPDATE users
            SET growth = growth + ?,
                water = water + ?,
                death = death + ?
            WHERE email = ?`, // Ensure the correct column and table names
           [growth, water, death, clientId]
        );

        // Close the connection
        await db.end();
    } catch (error) {
        console.error('Error updating plant data:', error);
        throw error;
    }
}

export async function updatePlantStats() {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  
    try {
      // 1. Query all users (assuming columns: email, growth, water, death)
      const [rows]: any = await db.query(
        `SELECT email, growth, water, death FROM users`
      );
  
      // 2. Prepare an array of updates (email + new growth/water/death values)
      const updates = [];
  
      for (const row of rows) {
        const { email, growth, water, death } = row;
  
        // Default to unchanged
        let newGrowth = growth;
        let newWater = water;
        let newDeath = death;
  
        if (death < 100) {
          let waterDiff = -1;
          let growthDiff = 0;
          if (growth > 0) {
            growthDiff = (water - 50)/100;
          }
          let deathDiff = 0;
          if (water < 50) {
            deathDiff = 1;
          }
  
          newGrowth = growth + growthDiff;
          newWater = water + waterDiff;
          newDeath = death + deathDiff;
        }
  
        // Optionally clamp them between 0 and 100
        newGrowth = clamp(newGrowth, 0, 100);
        newWater = clamp(newWater, 0, 100);
        newDeath = clamp(newDeath, 0, 100);
  
        // We'll collect these for the big CASE statement
        updates.push({
          email,
          growth: newGrowth,
          water: newWater,
          death: newDeath,
        });
      }
  
      // If there are no rows, nothing to do
      if (updates.length === 0) {
        await db.end();
        return;
      }
  
      // 3. Build a single bulk UPDATE query using CASE for each column
      const emails = updates.map(u => `'${u.email}'`).join(',');
  
      // CASE for growth
      const growthCase = updates
        .map(u => `WHEN '${u.email}' THEN ${u.growth}`)
        .join(' ');
  
      // CASE for water
      const waterCase = updates
        .map(u => `WHEN '${u.email}' THEN ${u.water}`)
        .join(' ');
  
      // CASE for death
      const deathCase = updates
        .map(u => `WHEN '${u.email}' THEN ${u.death}`)
        .join(' ');
  
      // Construct the final SQL
      const updateQuery = `
        UPDATE users
        SET
          growth = CASE email
            ${growthCase}
            ELSE growth
          END,
          water = CASE email
            ${waterCase}
            ELSE water
          END,
          death = CASE email
            ${deathCase}
            ELSE death
          END
        WHERE email IN (${emails});
      `;
  
      // 4. Run the single UPDATE statement
      await db.query(updateQuery);
    } catch (error) {
      console.error('Error in bulkUpdatePlantStats:', error);
      throw error;
    } finally {
      // 5. Close the connection
      await db.end();
    }
  }
  
  /** 
   * Utility to clamp a value to [min..max].
   */
  function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
  }