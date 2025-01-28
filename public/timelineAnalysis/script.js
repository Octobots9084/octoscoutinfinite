
document.getElementById('matchForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Get the input values
    const eventId = document.getElementById('eventId').value;
    const matchNumber = document.getElementById('matchNumber').value;
    
    // Fetch the match data from the TBA API
    const apiUrl = `https://www.thebluealliance.com/api/v3/event/${eventId}/matches `;
    const headers = { 'X-TBA-Auth-Key': 'iK9TUBQcow5iMaUHmoxTrJsT73CZfx7xRCweTo5MdUAUo05TW5e1YeR9gPRyDloj' };  // You can replace this with your API key or use open access
    
    try {
      const response = await fetch(apiUrl, { headers });
      const matches = await response.json();
      let match;
      // Find the match with the given match number
      for(i of matches){
        if(i.match_number==matchNumber){
            match=i;
        }
      }
      console.log(match);
      
      if (match) {
        const videoKey = match.videos[0].key;  // TBA stores video keys
        const videoUrl = `https://www.youtube.com/watch?v=${videoKey}`;
        
        // Display the video
        const videoEmbed = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoKey}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        document.getElementById('matchVideo').innerHTML = videoEmbed;
      } else {
        document.getElementById('matchVideo').innerHTML = 'No video found for this match.';
      }
    } catch (error) {
      console.error('Error fetching match data:', error);
      document.getElementById('matchVideo').innerHTML = 'An error occurred. Please try again later.';
    }
  });
  