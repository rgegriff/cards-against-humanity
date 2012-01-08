#!/bin/ruby

#white cards dawg
i = 0
for page in (1..23)
	y = 39
	for j in (1..5)
		puts "row " + j.to_s
		x = 20
		for m in (1..4)
			puts "	column " + m.to_s
			if m == 3 then x += 1 end
			system("convert CardsAgainstHumanity-" + page.to_s + ".jpg -crop 142x142+" + x.to_s + "+" + y.to_s + " white_card-" + i.to_s + ".jpg")
			x += 143
			i += 1
		end
		y += 143
	end
end
white_cards = i

# black cards yo
i = 0
for page in (24..27)
	y = 39
	for j in (1..5)
		puts "row " + j.to_s
		x = 20
		for m in (1..4)
			puts "	column " + m.to_s
			if m == 3 then x += 1 end
			system("convert CardsAgainstHumanity-" + page.to_s + ".jpg -crop 142x142+" + x.to_s + "+" + y.to_s + " black_card-" + i.to_s + ".jpg")
			x += 143
			i += 1
		end
		y += 144
	end
end

# last page of black cards is special
page = 28
y = 39
for j in (1..3)
	puts "row " + j.to_s
	x = 20
	if (j != 3)
		rows = 4
	else
		rows = 2
	end
	for m in (1..rows)
		puts "	column " + m.to_s
		if m == 3 then x += 1 end
		system("convert CardsAgainstHumanity-" + page.to_s + ".jpg -crop 142x142+" + x.to_s + "+" + y.to_s + " black_card-" + i.to_s + ".jpg")
		x += 143
		i += 1
	end
	y += 144
end

black_cards = i

puts "white cards: " + white_cards.to_s
puts "back cards: " + black_cards.to_s
