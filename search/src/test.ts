(async () => {
  console.log(
    await (
      await fetch('http://optimization:8000/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: [
            {
              open_time: 0,
              close_time: 0,
              stay: 0,
            },
          ],
          time_matrix: [[0]],
          start_node: {
            timedate: 0,
          },
          end_node: {
            timedate: 0,
          },
        }),
      })
    ).json(),
  );
})();
