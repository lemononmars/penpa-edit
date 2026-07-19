<script>
  let url = "https://example.com";
</script>
<iframe src={url} on:load={(e) => console.log(e.target.contentWindow)}></iframe>
