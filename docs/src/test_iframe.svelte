<script>
  let url = "https://example.com";
</script>
<iframe title="Example preview" src={url} on:load={(e) => console.log(e.target.contentWindow)}></iframe>
