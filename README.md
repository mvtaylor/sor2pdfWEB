# sor2pdfWEB

## About

Convert .sor files to a printable/PDF-able report entirely within your browser, no backend needed.

## Parser & Presenter

This package contains two components: a parser for the OTDR SOR format (specified by Telcordia standard SR-4731) and a report generation tool. The parser reads and enumerates the blocks of an SOR file, converting fields to more usable units. The reporter page, written using Astro, generates a printable report summarizing the information contained in the SOR file.