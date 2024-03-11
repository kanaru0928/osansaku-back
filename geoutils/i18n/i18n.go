package i18n

import (
	_ "embed"
	"fmt"
	"strings"

	"golang.org/x/text/language"
	"gopkg.in/yaml.v3"
)

//go:embed strings.yml
var stringsYaml []byte

type LangText = map[string]string

type I18nStrings struct {
	Address LangText `yaml:"address"`
	UnknownSpot LangText `yaml:"unknown_spot"`
}

type I18n struct {
	Strings *I18nStrings
}

var T *I18n

var languages = []language.Tag{
	language.AmericanEnglish,
	language.Japanese,
}

func init() {
	T = new(I18n)
	err := yaml.Unmarshal(stringsYaml, &T.Strings)
	if err != nil {
		fmt.Printf("YAML Unmarshal Error")
		panic(err)
	}
}

func Get(text LangText, acceptLanguage string, args ...any) string {
	matcher := language.NewMatcher(languages)
	t, _, _ := language.ParseAcceptLanguage(acceptLanguage)
	tag, _, _ := matcher.Match(t...)

	s := text[tag.String()]

	for i, arg := range args {
		s = strings.Replace(s, fmt.Sprintf("$%d", i+1), fmt.Sprintf("%v", arg), -1)
	}

	return s
}
