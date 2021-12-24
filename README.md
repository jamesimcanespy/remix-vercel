# Vimeo Showcase to Direct Publisher Feed Aggregator

## Purpose

Allows multiple Vimeo Showcases to be aggregated into a DirectPublisher Feed. Videos in each showcase have the showcase name added as a video tag in the final Direct Publisher Feed

### Operation

Vimeo Showcases include a Roku Direct Publisher feed Url which takes the following form

```html
https://vimeo.com/showcase/{id}/feed/roku/{roku}`
```

where ```{id}``` is the showcase identifier and ```{roku}``` is the unique roku label

The application is configured with one or more Vimeo showcase entries then aggregates each DirectPublisher feed into a single aggregated feed. Each video in vimeo showcase has the showcase name added as a tag in the final aggregated feed to allow showcase names to be used as Roku categories.
