#!/usr/bin/perl -w
use strict;

my $filename = $ARGV[0];
open( my $fh, '<', $filename ) or die "Can't open $filename: $!";

my %latlongs = ();

while ( my $line = <$fh> ) {
	chomp($line);
	my ($type, $name, $latlong, $details, $url) = split(/\t/, $line);
	my ($lat, $long) = split(/,\s/, $latlong);
	if (exists $latlongs{$lat.$long}){
		print "Duplicate";
	}else {
		
		if ($type == 3){
			$type = "Nursing";
		}else {
			$type = "Play";
		}

		$latlongs{$lat."&".$long} = [$lat, $long, $type, $name, $details, $url];
	}
}
close $fh;

foreach my $llkey (keys %latlongs){
	my @latLongArray = @{$latlongs{$llkey}};
	print "{lat:\"".
	$latLongArray[0].
	"\", lon:\"".
	$latLongArray[1].
	"\", type:\"".
	$latLongArray[2].
	"\", name:\"".
	$latLongArray[3].
	"\", details:\"".
	$latLongArray[4].
	"\", url:\"".
	$latLongArray[5].
	"\"},";
}
